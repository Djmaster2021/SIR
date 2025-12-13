from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from reservas.api_auth import EmailOrUsernameAuthToken


def api_root(request):
    return JsonResponse({
        "message": "SIR API funcionando",
        "endpoints": [
            "/admin/",
            "/api/negocios/",
            "/api/servicios/",
            "/api/mesas/",
            "/api/clientes/",
            "/api/citas/",
        ]
    })


urlpatterns = [
    path('', api_root, name='api-root'),
    path('admin/', admin.site.urls),
    path('api/', include('reservas.urls')),
    path('api-auth/', include('rest_framework.urls')),
    path('api/auth/login/', EmailOrUsernameAuthToken.as_view(), name='api-login'),
]
