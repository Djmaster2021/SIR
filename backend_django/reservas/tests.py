from datetime import date, datetime, time, timedelta
from unittest import mock

from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from django.urls import reverse

from googleapiclient.errors import HttpError
from rest_framework.test import APIClient

from .models import CalendarCredential, Cita, Cliente, Mesa, Negocio, Servicio
from .google_sync import _build_event_body, resync_calendar_events, sync_cita_to_calendar
from .serializers import CitaSerializer, MesaSerializer
from .utils import suggest_slot


class BaseTestData(TestCase):
    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(
            username="tester",
            email="tester@example.com",
            password="pass1234",
        )
        self.negocio = Negocio.objects.create(
            nombre="Restaurante Prueba",
            propietario=self.user,
            direccion="Calle 1",
            telefono="1234567890",
        )
        self.servicio = Servicio.objects.create(
            negocio=self.negocio,
            nombre="Mesa 2 personas",
            duracion_minutos=60,
            precio=0,
        )
        self.cliente = Cliente.objects.create(
            negocio=self.negocio,
            nombre="Cliente Uno",
            email="cliente@ejemplo.com",
        )
        # Solo una mesa activa para probar saturación
        self.mesa = Mesa.objects.create(
            negocio=self.negocio,
            servicio=self.servicio,
            nombre="Mesa 1",
            tipo="normal_2",
            capacidad_min=1,
            capacidad_max=2,
            activa=True,
        )


class CitaSerializerTests(BaseTestData):
    def test_no_permite_fecha_pasada(self):
        data = {
            "negocio": self.negocio.id,
            "servicio": self.servicio.id,
            "cliente": self.cliente.id,
            "fecha": date.today() - timedelta(days=1),
            "hora_inicio": time(14, 0),
            "hora_fin": time(15, 0),
            "estado": "confirmada",
        }
        serializer = CitaSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("fecha de la cita no puede ser anterior a hoy", str(serializer.errors))

    def test_rechaza_mas_citas_que_mesas_disponibles(self):
        # Primera cita válida
        primera = CitaSerializer(
            data={
                "negocio": self.negocio.id,
                "servicio": self.servicio.id,
                "cliente": self.cliente.id,
                "fecha": date.today() + timedelta(days=1),
                "hora_inicio": time(14, 0),
                "hora_fin": time(15, 0),
                "estado": "confirmada",
            }
        )
        self.assertTrue(primera.is_valid(), primera.errors)
        primera.save()

        # Segunda cita en mismo horario y servicio debe rechazarse porque solo hay 1 mesa activa
        segunda = CitaSerializer(
            data={
                "negocio": self.negocio.id,
                "servicio": self.servicio.id,
                "cliente": self.cliente.id,
                "fecha": date.today() + timedelta(days=1),
                "hora_inicio": time(14, 30),
                "hora_fin": time(15, 30),
                "estado": "pendiente",
            }
        )
        self.assertFalse(segunda.is_valid())
        self.assertIn("No hay mesas disponibles", str(segunda.errors))

    def test_cliente_de_otro_negocio_no_es_permitido(self):
        other_negocio = Negocio.objects.create(
            nombre="Otro",
            propietario=self.user,
        )
        cliente_otro = Cliente.objects.create(
            negocio=other_negocio,
            nombre="Fuera",
        )
        data = {
            "negocio": self.negocio.id,
            "servicio": self.servicio.id,
            "cliente": cliente_otro.id,
            "fecha": date.today() + timedelta(days=2),
            "hora_inicio": time(16, 0),
            "hora_fin": time(17, 0),
            "estado": "confirmada",
        }
        serializer = CitaSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("cliente seleccionado no pertenece", str(serializer.errors))

    def test_envia_notificacion_post_save(self):
        # Verifica que el signal no rompa el flujo aunque no haya email (fail_silently=True)
        data = {
            "negocio": self.negocio.id,
            "servicio": self.servicio.id,
            "cliente": self.cliente.id,
            "fecha": date.today() + timedelta(days=1),
            "hora_inicio": time(17, 0),
            "hora_fin": time(18, 0),
            "estado": "confirmada",
            "notas": "Test signal",
        }
        serializer = CitaSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        cita = serializer.save()
        self.assertEqual(cita.estado, "confirmada")


class MesaSerializerTests(BaseTestData):
    def test_capacidad_min_no_supera_max(self):
        data = {
            "negocio": self.negocio.id,
            "servicio": self.servicio.id,
            "nombre": "Mesa X",
            "tipo": "normal_2",
            "capacidad_min": 4,
            "capacidad_max": 2,
            "activa": True,
        }
        serializer = MesaSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("capacidad_min no puede ser mayor", str(serializer.errors))


class SuggestionTests(BaseTestData):
    def test_sugerencia_no_solapa_y_elige_siguiente_hueco(self):
        # Cita ocupa 14:00-15:00
        Cita.objects.create(
            negocio=self.negocio,
            servicio=self.servicio,
            cliente=self.cliente,
            fecha=date.today() + timedelta(days=1),
            hora_inicio=time(14, 0),
            hora_fin=time(15, 0),
            estado="confirmada",
        )
        slot = suggest_slot(
            servicio=self.servicio,
            fecha_desde=date.today() + timedelta(days=1),
            duracion_minutos=60,
        )
        self.assertIsNotNone(slot)
        self.assertEqual(slot.hora_inicio, time(15, 0))
        self.assertEqual(slot.hora_fin, time(16, 0))

    def test_sugerencia_responde_none_sin_mesas_activas(self):
        self.mesa.activa = False
        self.mesa.save()
        slot = suggest_slot(
            servicio=self.servicio,
            fecha_desde=date.today() + timedelta(days=1),
            duracion_minutos=60,
        )
        self.assertIsNone(slot)

    def test_sugerencia_preferencia_hora(self):
        # Libre, pero preferimos 19:00
        preferida = time(19, 0)
        slot = suggest_slot(
            servicio=self.servicio,
            fecha_desde=date.today() + timedelta(days=1),
            duracion_minutos=60,
            prefer_hora=preferida,
        )
        self.assertIsNotNone(slot)
        self.assertEqual(slot.hora_inicio, preferida)


class _FakeResponse:
    def __init__(self, status, reason=""):
        self.status = status
        self.reason = reason


class _FakeRequest:
    def __init__(self, payload=None, exception=None):
        self.payload = payload
        self.exception = exception

    def execute(self):
        if self.exception:
            raise self.exception
        return self.payload


class _FakeEventsService:
    def __init__(self):
        self.store = {}

    def insert(self, calendarId, body, sendUpdates=None):
        event_id = f"evt_{len(self.store) + 1}"
        payload = {"id": event_id, **body}
        self.store[event_id] = payload
        return _FakeRequest(payload)

    def update(self, calendarId, eventId, body):
        if eventId not in self.store:
            return _FakeRequest(exception=HttpError(_FakeResponse(404), b""))
        self.store[eventId].update(body)
        return _FakeRequest(self.store[eventId])

    def delete(self, calendarId, eventId):
        if eventId not in self.store:
            return _FakeRequest(exception=HttpError(_FakeResponse(404), b""))
        self.store.pop(eventId, None)
        return _FakeRequest({})

    def get(self, calendarId, eventId):
        if eventId not in self.store:
            return _FakeRequest(exception=HttpError(_FakeResponse(404), b""))
        return _FakeRequest(self.store[eventId])


class _FakeCalendarService:
    def __init__(self):
        self.events_service = _FakeEventsService()

    def events(self):
        return self.events_service


class GoogleCalendarSyncTests(BaseTestData):
    @override_settings(TIME_ZONE="UTC")
    def test_event_body_agrega_zona_horaria(self):
        cita = Cita.objects.create(
            negocio=self.negocio,
            servicio=self.servicio,
            cliente=self.cliente,
            fecha=date.today() + timedelta(days=1),
            hora_inicio=time(10, 0),
            hora_fin=time(11, 0),
            estado="confirmada",
        )

        body = _build_event_body(cita)
        start_iso = body["start"]["dateTime"]
        parsed = datetime.fromisoformat(start_iso)
        self.assertIsNotNone(parsed.tzinfo)
        self.assertEqual(body["start"]["timeZone"], "UTC")

    @mock.patch("reservas.signals.sync_cita_to_calendar")
    @mock.patch("reservas.google_sync._get_service")
    def test_resync_crea_evento_cuando_no_existe(self, mock_get_service, _mock_signal):
        fake_service = _FakeCalendarService()
        mock_get_service.return_value = (fake_service, "primary")
        cita = Cita.objects.create(
            negocio=self.negocio,
            servicio=self.servicio,
            cliente=self.cliente,
            fecha=date.today() + timedelta(days=1),
            hora_inicio=time(9, 0),
            hora_fin=time(10, 0),
            estado="confirmada",
        )

        creados, actualizados = resync_calendar_events(service=fake_service, calendar_id="primary")
        cita.refresh_from_db()

        self.assertEqual(creados, 1)
        self.assertEqual(actualizados, 0)
        self.assertTrue(cita.event_id)
        self.assertIn(cita.event_id, fake_service.events_service.store)

    @mock.patch("reservas.signals.sync_cita_to_calendar")
    @mock.patch("reservas.google_sync._get_service")
    def test_resync_actualiza_evento_existente(self, mock_get_service, _mock_signal):
        fake_service = _FakeCalendarService()
        mock_get_service.return_value = (fake_service, "primary")
        cita = Cita.objects.create(
            negocio=self.negocio,
            servicio=self.servicio,
            cliente=self.cliente,
            fecha=date.today() + timedelta(days=2),
            hora_inicio=time(12, 0),
            hora_fin=time(13, 0),
            estado="confirmada",
            event_id="evt_1",
        )
        fake_service.events_service.store["evt_1"] = {"id": "evt_1", "summary": "antiguo"}

        creados, actualizados = resync_calendar_events(service=fake_service, calendar_id="primary")

        self.assertEqual(creados, 0)
        self.assertEqual(actualizados, 1)
        self.assertEqual(fake_service.events_service.store["evt_1"]["summary"], f"Cita: {self.servicio.nombre} - {self.cliente.nombre}")

    @mock.patch("reservas.signals.sync_cita_to_calendar")
    @mock.patch("reservas.google_sync._get_service")
    def test_sync_recrea_cuando_calendar_devuelve_404(self, mock_get_service, _mock_signal):
        fake_service = _FakeCalendarService()
        mock_get_service.return_value = (fake_service, "primary")
        cita = Cita.objects.create(
            negocio=self.negocio,
            servicio=self.servicio,
            cliente=self.cliente,
            fecha=date.today() + timedelta(days=3),
            hora_inicio=time(14, 0),
            hora_fin=time(15, 0),
            estado="confirmada",
            event_id="fantasma",
        )

        sync_cita_to_calendar(cita)
        cita.refresh_from_db()

        self.assertNotEqual(cita.event_id, "fantasma")
        self.assertIn(cita.event_id, fake_service.events_service.store)


class GoogleCalendarApiTests(BaseTestData):
    def setUp(self):
        super().setUp()
        self.client = APIClient()

    def test_status_sin_credenciales(self):
        resp = self.client.get(reverse("google-status"))
        self.assertEqual(resp.status_code, 200)
        self.assertFalse(resp.data["authorized"])
        self.assertEqual(resp.data["calendar_id"], "primary")

    def test_config_sin_credenciales_falla(self):
        resp = self.client.post(reverse("google-calendar"), {"calendar_id": "my-cal"})
        self.assertEqual(resp.status_code, 400)

    @mock.patch("reservas.signals.sync_cita_to_calendar")
    @mock.patch("reservas.google_sync._get_service")
    def test_resync_endpoint_funciona(self, mock_get_service, _mock_signal):
        fake_service = _FakeCalendarService()
        mock_get_service.return_value = (fake_service, "primary")
        CalendarCredential.objects.create(
            nombre="default",
            calendar_id="primary",
            credentials_json={
                "token": "x",
                "refresh_token": "r",
                "token_uri": "https://oauth2.googleapis.com/token",
                "client_id": "cid",
                "client_secret": "secret",
                "scopes": ["https://www.googleapis.com/auth/calendar"],
                "expiry": "2999-01-01T00:00:00Z",
            },
        )
        Cita.objects.create(
            negocio=self.negocio,
            servicio=self.servicio,
            cliente=self.cliente,
            fecha=date.today() + timedelta(days=1),
            hora_inicio=time(10, 0),
            hora_fin=time(11, 0),
            estado="confirmada",
        )

        with mock.patch("reservas.views_google.calendar_status", return_value={"authorized": True}):
            resp = self.client.post(reverse("google-resync"), {"limit": 5})
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["created"], 1)
        self.assertEqual(resp.data["updated"], 0)
