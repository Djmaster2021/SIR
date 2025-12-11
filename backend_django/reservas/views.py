from rest_framework import viewsets, permissions, filters
from .models import Negocio, Servicio, Cliente, Cita
from .serializers import (
    NegocioSerializer,
    ServicioSerializer,
    ClienteSerializer,
    CitaSerializer,
)


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
