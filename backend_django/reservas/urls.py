from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    NegocioViewSet,
    ServicioViewSet,
    ClienteViewSet,
    CitaViewSet,
)

router = DefaultRouter()
router.register(r'negocios', NegocioViewSet, basename='negocio')
router.register(r'servicios', ServicioViewSet, basename='servicio')
router.register(r'clientes', ClienteViewSet, basename='cliente')
router.register(r'citas', CitaViewSet, basename='cita')

urlpatterns = [
    path('', include(router.urls)),
]
