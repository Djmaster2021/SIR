from datetime import date, time
import json
import os
from urllib import request as urlrequest
from urllib.error import HTTPError, URLError
from rest_framework import viewsets, permissions, filters
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.views import APIView
from django.conf import settings
from .models import Negocio, Servicio, Cliente, Cita, Mesa
from .serializers import (
    NegocioSerializer,
    ServicioSerializer,
    ClienteSerializer,
    CitaSerializer,
    MesaSerializer,
)
from .utils import suggest_slot, available_slots


# ====== VISTAS SIMPLES PARA DESARROLLO ======
# TODO: Más adelante metemos permisos por usuario / auth seria


class NegocioViewSet(viewsets.ModelViewSet):
    """
    CRUD de negocios.
    Por ahora devuelve TODOS los negocios sin filtrar por usuario.
    """
    queryset = Negocio.objects.all().order_by('-creado_en')
    serializer_class = NegocioSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nombre', 'direccion', 'telefono', 'email_contacto']
    ordering_fields = ['creado_en', 'nombre']


class ServicioViewSet(viewsets.ModelViewSet):
    """
    CRUD de servicios.
    """
    # Ordenamos por id para mantener consistencia de selección en frontend
    queryset = Servicio.objects.all().order_by('id')
    serializer_class = ServicioSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nombre', 'descripcion']
    ordering_fields = ['precio', 'duracion_minutos', 'nombre']


class ClienteViewSet(viewsets.ModelViewSet):
    """
    CRUD de clientes.
    """
    queryset = Cliente.objects.all().order_by('-creado_en')
    serializer_class = ClienteSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nombre', 'email', 'telefono']
    ordering_fields = ['creado_en', 'nombre']


class MesaViewSet(viewsets.ModelViewSet):
    """
    CRUD de mesas físicas en el restaurante.
    """
    queryset = Mesa.objects.select_related('negocio', 'servicio').order_by('negocio__nombre', 'nombre')
    serializer_class = MesaSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nombre', 'tipo', 'servicio__nombre', 'negocio__nombre']
    ordering_fields = ['nombre', 'capacidad_max']


class CitaViewSet(viewsets.ModelViewSet):
    """
    CRUD de citas.
    """
    queryset = Cita.objects.select_related('negocio', 'servicio', 'cliente').order_by(
        '-fecha', '-hora_inicio'
    )
    serializer_class = CitaSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = [
        'cliente__nombre',
        'servicio__nombre',
        'estado',
        'notas',
    ]
    ordering_fields = ['fecha', 'hora_inicio', 'creado_en']


class AgendaSuggestionView(APIView):
    """
    Sugerencia de agenda para un servicio dado, optimizando huecos.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        servicio_id = request.query_params.get("servicio")
        fecha_desde = request.query_params.get("desde")
        duracion = request.query_params.get("duracion")
        prefer_hora = request.query_params.get("prefer_hora")

        if not servicio_id:
            return Response(
                {"detail": "Parámetro 'servicio' es requerido."},
                status=400,
            )

        try:
            servicio = Servicio.objects.get(pk=servicio_id)
        except Servicio.DoesNotExist:
            return Response({"detail": "Servicio no encontrado."}, status=404)

        try:
            fecha_desde_val = (
                date.fromisoformat(fecha_desde) if fecha_desde else None
            )
        except ValueError:
            return Response({"detail": "Fecha inválida. Usa YYYY-MM-DD."}, status=400)

        try:
            prefer_hora_val = (
                time.fromisoformat(prefer_hora) if prefer_hora else None
            )
        except ValueError:
            return Response({"detail": "Hora inválida. Usa HH:MM."}, status=400)

        duracion_val = None
        if duracion:
            try:
                duracion_val = int(duracion)
            except ValueError:
                return Response({"detail": "Duración debe ser numérica (minutos)."}, status=400)

        suggestion = suggest_slot(
            servicio=servicio,
            fecha_desde=fecha_desde_val,
            duracion_minutos=duracion_val,
            prefer_hora=prefer_hora_val,
        )

        if not suggestion:
            return Response({"detail": "Sin disponibilidad en los próximos días."}, status=409)

        return Response(
            {
                "servicio": servicio.id,
                "fecha": suggestion.fecha,
                "hora_inicio": suggestion.hora_inicio.strftime("%H:%M"),
                "hora_fin": suggestion.hora_fin.strftime("%H:%M"),
                "razon": suggestion.razon,
            }
        )


class AgendaAvailabilityView(APIView):
    """
    Devuelve slots disponibles para un servicio y fecha.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        servicio_id = request.query_params.get("servicio")
        fecha_str = request.query_params.get("fecha")

        if not servicio_id or not fecha_str:
            return Response({"detail": "Parámetros 'servicio' y 'fecha' son requeridos."}, status=400)

        try:
            servicio = Servicio.objects.get(pk=servicio_id, activo=True)
        except Servicio.DoesNotExist:
            return Response({"detail": "Servicio no encontrado o inactivo."}, status=404)

        try:
            fecha_val = date.fromisoformat(fecha_str)
        except ValueError:
            return Response({"detail": "Fecha inválida. Usa YYYY-MM-DD."}, status=400)

        slots = available_slots(servicio, fecha_val)
        return Response(
            [
                {
                    "hora_inicio": h_ini.strftime("%H:%M"),
                    "hora_fin": h_fin.strftime("%H:%M"),
                }
                for h_ini, h_fin in slots
            ]
        )


class PublicMesaAvailabilityView(APIView):
    """
    Devuelve disponibilidad agregada de mesas por servicio y horario sin exponer datos sensibles.
    """

    permission_classes = [AllowAny]

    def get(self, request):
        servicio_id = request.query_params.get("servicio")
        fecha_str = request.query_params.get("fecha")
        hora_inicio_str = request.query_params.get("hora_inicio")
        hora_fin_str = request.query_params.get("hora_fin")

        if not fecha_str or not hora_inicio_str:
            return Response({"detail": "Parámetros 'fecha' y 'hora_inicio' son requeridos."}, status=400)

        try:
            fecha_val = date.fromisoformat(fecha_str)
        except ValueError:
            return Response({"detail": "Fecha inválida. Usa YYYY-MM-DD."}, status=400)

        try:
            hora_inicio_val = time.fromisoformat(hora_inicio_str)
            hora_fin_val = time.fromisoformat(hora_fin_str) if hora_fin_str else None
        except ValueError:
            return Response({"detail": "Hora inválida. Usa HH:MM."}, status=400)

        # Permite traer todas las mesas activas con servicio=all (vista agregada)
        if servicio_id == "all" or not servicio_id:
            mesas = Mesa.objects.filter(activa=True, servicio__activo=True)
            servicios_ids = mesas.values_list("servicio_id", flat=True).distinct()
        else:
            try:
                servicio = Servicio.objects.get(pk=servicio_id, activo=True)
            except Servicio.DoesNotExist:
                return Response({"detail": "Servicio no encontrado o inactivo."}, status=404)
            mesas = Mesa.objects.filter(servicio=servicio, activa=True)
            servicios_ids = [servicio.id]
        choice_labels = {key: label for key, label in Mesa.TIPO_CHOICES}
        grouped = {}
        for mesa in mesas:
            tipo_key = (mesa.tipo or mesa.nombre or "general").strip()
            display_name = choice_labels.get(mesa.tipo, mesa.nombre or tipo_key)
            if tipo_key not in grouped:
                grouped[tipo_key] = {
                    "id": tipo_key,
                    "nombre": display_name,
                    "capacidad": mesa.capacidad_max or mesa.capacidad_min or 4,
                    "total": 0,
                    "ocupadas": 0,
                    "precio": float(getattr(mesa.servicio, "precio", 0) or 0),
                }
            grouped[tipo_key]["total"] += 1

        estados_activos = ("pendiente", "confirmada")
        if hora_fin_val:
            citas_qs = Cita.objects.filter(
                servicio_id__in=servicios_ids,
                fecha=fecha_val,
                estado__in=estados_activos,
                hora_inicio__lt=hora_fin_val,
                hora_fin__gt=hora_inicio_val,
            )
        else:
            citas_qs = Cita.objects.filter(
                servicio_id__in=servicios_ids,
                fecha=fecha_val,
                estado__in=estados_activos,
                hora_inicio__gte=hora_inicio_val,
            )

        ocupadas_total = citas_qs.count()
        total_mesas = sum([item["total"] for item in grouped.values()]) or 1
        for tipo_key, data in grouped.items():
            proporcional = (ocupadas_total * data["total"]) // total_mesas
            data["ocupadas"] = min(proporcional, data["total"])

        return Response(list(grouped.values()))


class MercadoPagoPreferenceView(APIView):
    """
    Crea una preferencia de pago en Mercado Pago usando MP_ACCESS_TOKEN del entorno.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        mp_token = os.getenv("MP_ACCESS_TOKEN")
        if not mp_token:
            return Response({"detail": "Configura MP_ACCESS_TOKEN en el backend."}, status=500)

        servicio_id = request.data.get("servicio")
        titulo = request.data.get("titulo", "Reserva El Mirador")
        precio = request.data.get("precio", 0)
        try:
            precio_val = float(precio)
        except (ValueError, TypeError):
            precio_val = 0

        if not servicio_id:
            return Response({"detail": "servicio es requerido."}, status=400)

        # URLs de redirección
        origin = request.META.get("HTTP_ORIGIN") or request.build_absolute_uri("/").rstrip("/")
        success_url = request.data.get("success_url") or f"{origin}/reservar?lang=es&paid=1"
        failure_url = request.data.get("failure_url") or f"{origin}/reservar?lang=es&paid=0"

        payload = {
            "items": [
                {
                    "title": titulo,
                    "quantity": 1,
                    "unit_price": max(precio_val, 0.0),
                    "currency_id": "MXN",
                }
            ],
            "back_urls": {
                "success": success_url,
                "failure": failure_url,
                "pending": failure_url,
            },
            "auto_return": "approved",
            "metadata": {"servicio": servicio_id},
        }

        req = urlrequest.Request(
            "https://api.mercadopago.com/checkout/preferences",
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {mp_token}",
                "Content-Type": "application/json",
            },
        )
        try:
            with urlrequest.urlopen(req, timeout=8) as resp:
                body = resp.read().decode("utf-8")
                data = json.loads(body)
                use_sandbox_env = os.getenv("MP_USE_SANDBOX")
                # Por defecto usar sandbox si no está definido el env (seguro para pruebas e integración).
                use_sandbox = settings.DEBUG or use_sandbox_env is None or use_sandbox_env.lower() in ("1", "true", "yes")
                redirect_url = data.get("sandbox_init_point") if use_sandbox else data.get("init_point")
                return Response(
                    {
                        "id": data.get("id"),
                        "init_point": data.get("init_point"),
                        "sandbox_init_point": data.get("sandbox_init_point"),
                        "redirect": redirect_url,
                    }
                )
        except HTTPError as e:
            msg = e.read().decode("utf-8") if hasattr(e, "read") else str(e)
            if os.getenv("MP_FAKE_PREF", "").lower() in ("1", "true", "yes"):
                fake = {
                    "id": "fake_pref_debug",
                    "init_point": f"{success_url}&mp_mock=1",
                    "sandbox_init_point": f"{success_url}&mp_mock=1",
                    "warning": "Usando preferencia simulada; revisar conectividad Mercado Pago.",
                    "error": msg,
                }
                return Response(fake)
            return Response({"detail": "Error creando preferencia", "error": msg}, status=502)
        except URLError as e:
            if os.getenv("MP_FAKE_PREF", "").lower() in ("1", "true", "yes"):
                fake = {
                    "id": "fake_pref_debug",
                    "init_point": f"{success_url}&mp_mock=1",
                    "sandbox_init_point": f"{success_url}&mp_mock=1",
                    "warning": "Usando preferencia simulada; revisar conectividad Mercado Pago.",
                    "error": str(e),
                }
                return Response(fake)
            return Response({"detail": "No se pudo conectar a Mercado Pago.", "error": str(e)}, status=502)
