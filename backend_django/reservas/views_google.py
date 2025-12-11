import json
from django.conf import settings
from django.shortcuts import redirect
from rest_framework.response import Response
from rest_framework.views import APIView
from google_auth_oauthlib.flow import Flow
import os

from .models import CalendarCredential
from .google_sync import calendar_status, resync_calendar_events


def _flow():
    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET or not settings.GOOGLE_REDIRECT_URI:
        raise ValueError("Faltan GOOGLE_CLIENT_ID/SECRET/REDIRECT_URI en la configuración.")

    client_config = {
        "web": {
            "client_id": settings.GOOGLE_CLIENT_ID,
            "project_id": "sir-calendar",
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "redirect_uris": [settings.GOOGLE_REDIRECT_URI],
            "javascript_origins": [],
        }
    }

    return Flow.from_client_config(
        client_config,
        scopes=["https://www.googleapis.com/auth/calendar"],
        redirect_uri=settings.GOOGLE_REDIRECT_URI,
    )


class GoogleAuthStart(APIView):
    """
    Redirige a Google para consentir acceso al Calendar.
    """

    def get(self, request):
        if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
            return Response({"detail": "Configura GOOGLE_CLIENT_ID/SECRET en .env"}, status=400)

        flow = _flow()
        auth_url, state = flow.authorization_url(
            access_type="offline",
            include_granted_scopes="true",
            prompt="consent",
        )
        request.session["google_state"] = state
        return redirect(auth_url)


class GoogleAuthCallback(APIView):
    """
    Recibe el código de Google y guarda las credenciales.
    """

    def get(self, request):
        state = request.session.get("google_state")
        flow = _flow()
        # Permitir HTTP en desarrollo (solo para local)
        os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"
        flow.fetch_token(authorization_response=request.build_absolute_uri())
        creds = flow.credentials

        CalendarCredential.objects.update_or_create(
            nombre="default",
            defaults={
                "calendar_id": settings.GOOGLE_CALENDAR_ID,
                "credentials_json": json.loads(creds.to_json()),
            },
        )
        return Response({"detail": "Credenciales guardadas. Calendar sincronizado."})


class GoogleCalendarStatus(APIView):
    """
    Devuelve el estado de la integración con Calendar.
    """

    def get(self, request):
        return Response(calendar_status())


class GoogleCalendarConfig(APIView):
    """
    Permite actualizar el calendar_id y disparar resync si se desea.
    """

    def post(self, request):
        calendar_id = request.data.get("calendar_id")
        do_resync = bool(request.data.get("resync"))

        if not calendar_id:
            return Response({"detail": "calendar_id requerido"}, status=400)

        cred_obj = CalendarCredential.objects.first()
        if cred_obj:
            cred_obj.calendar_id = calendar_id
            cred_obj.save(update_fields=["calendar_id", "actualizado_en"])
        else:
            return Response({"detail": "Primero autoriza con Google para guardar credenciales."}, status=400)

        created = updated = 0
        if do_resync:
            created, updated = resync_calendar_events()

        return Response(
            {
                "detail": "Calendar actualizado",
                "calendar_id": cred_obj.calendar_id,
                "resync": {"created": created, "updated": updated},
            }
        )


class GoogleCalendarResync(APIView):
    """
    Endpoint para forzar resincronización manual de citas futuras.
    """

    def post(self, request):
        limit = request.data.get("limit") or 200
        try:
            limit = int(limit)
        except (TypeError, ValueError):
            return Response({"detail": "limit debe ser entero"}, status=400)

        status = calendar_status()
        if not status["authorized"]:
            return Response({"detail": "Primero autoriza con Google Calendar."}, status=400)

        created, updated = resync_calendar_events(limit=limit)
        return Response({"created": created, "updated": updated})
