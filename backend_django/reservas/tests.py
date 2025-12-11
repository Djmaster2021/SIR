from datetime import date, time, timedelta

from django.contrib.auth import get_user_model
from django.test import TestCase

from .models import Negocio, Servicio, Cliente, Cita, Mesa
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
