from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse


def api_root(request):
    return JsonResponse({
        "message": "SIR API funcionando",
        "endpoints": [
            "/admin/",
            "/api/negocios/",
            "/api/servicios/",
            "/api/clientes/",
            "/api/citas/",
        ]
    })


urlpatterns = [
    path('', api_root, name='api-root'),
    path('admin/', admin.site.urls),
    path('api/', include('reservas.urls')),
    path('api-auth/', include('rest_framework.urls')),
]
