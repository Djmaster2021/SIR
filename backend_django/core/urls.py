from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.views.generic import RedirectView
from django.templatetags.static import static

from reservas.api_auth import EmailOrUsernameAuthToken

from reservas.views_google import (
    GoogleAuthStart,
    GoogleAuthCallback,
    GoogleCalendarStatus,
    GoogleCalendarConfig,
    GoogleCalendarResync,
)


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
            "/api/auth/login/",
            "/api-auth/",
            "/api/google/auth-url/",
            "/api/google/callback",
            "/api/google/status/",
            "/api/google/config/",
            "/api/google/resync/",
        ]
    })


urlpatterns = [
    path("", api_root, name="api-root"),
    path("admin/", admin.site.urls),

    # App principal (reservas)
    path("api/", include("reservas.urls")),

    # DRF login (opcional)
    path("api-auth/", include("rest_framework.urls")),

    # Login por token (tu endpoint)
    path("api/auth/login/", EmailOrUsernameAuthToken.as_view(), name="api-login"),

    # Google Calendar OAuth (no es registro/login de usuarios)
    path("api/google/auth-url/", GoogleAuthStart.as_view(), name="google-calendar-auth-url"),
    path("api/google/callback", GoogleAuthCallback.as_view(), name="google-calendar-callback"),
    path("api/google/status/", GoogleCalendarStatus.as_view(), name="google-calendar-status"),
    path("api/google/config/", GoogleCalendarConfig.as_view(), name="google-calendar-config"),
    path("api/google/resync/", GoogleCalendarResync.as_view(), name="google-calendar-resync"),

    # Favicon
    path("favicon.ico", RedirectView.as_view(url=static("favicon.png"), permanent=False)),
]
