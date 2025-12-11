from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    NegocioViewSet,
    ServicioViewSet,
    ClienteViewSet,
    CitaViewSet,
    MesaViewSet,
    AgendaSuggestionView,
    AgendaAvailabilityView,
)
from .api_public import crear_cita_publica
from .views_google import (
    GoogleAuthStart,
    GoogleAuthCallback,
    GoogleCalendarStatus,
    GoogleCalendarConfig,
    GoogleCalendarResync,
)

router = DefaultRouter()
router.register(r'negocios', NegocioViewSet, basename='negocio')
router.register(r'servicios', ServicioViewSet, basename='servicio')
router.register(r'clientes', ClienteViewSet, basename='cliente')
router.register(r'mesas', MesaViewSet, basename='mesa')
router.register(r'citas', CitaViewSet, basename='cita')

urlpatterns = [
    path('', include(router.urls)),
    path('agenda/sugerir/', AgendaSuggestionView.as_view(), name='agenda-sugerir'),
    path('agenda/disponibilidad/', AgendaAvailabilityView.as_view(), name='agenda-disponibilidad'),
    path('public/citas/', crear_cita_publica, name='crear-cita-publica'),
    path('google/authorize/', GoogleAuthStart.as_view(), name='google-authorize'),
    path('google/callback/', GoogleAuthCallback.as_view(), name='google-callback'),
    path('google/status/', GoogleCalendarStatus.as_view(), name='google-status'),
    path('google/calendar/', GoogleCalendarConfig.as_view(), name='google-calendar'),
    path('google/resync/', GoogleCalendarResync.as_view(), name='google-resync'),
]
