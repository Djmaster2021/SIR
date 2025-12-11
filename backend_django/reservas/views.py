from rest_framework import viewsets, permissions, filters
from rest_framework.response import Response
from rest_framework.views import APIView
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
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nombre', 'direccion', 'telefono', 'email_contacto']
    ordering_fields = ['creado_en', 'nombre']


class ServicioViewSet(viewsets.ModelViewSet):
    """
    CRUD de servicios.
    """
    queryset = Servicio.objects.all().order_by('nombre')
    serializer_class = ServicioSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nombre', 'descripcion']
    ordering_fields = ['precio', 'duracion_minutos', 'nombre']


class ClienteViewSet(viewsets.ModelViewSet):
    """
    CRUD de clientes.
    """
    queryset = Cliente.objects.all().order_by('-creado_en')
    serializer_class = ClienteSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nombre', 'email', 'telefono']
    ordering_fields = ['creado_en', 'nombre']


class MesaViewSet(viewsets.ModelViewSet):
    """
    CRUD de mesas físicas en el restaurante.
    """
    queryset = Mesa.objects.select_related('negocio', 'servicio').order_by('negocio__nombre', 'nombre')
    serializer_class = MesaSerializer
    permission_classes = [permissions.AllowAny]
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
    permission_classes = [permissions.AllowAny]
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
