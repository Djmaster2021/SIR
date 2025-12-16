import json

from django.conf import settings
from django.http import JsonResponse, HttpResponseBadRequest
from django.views.decorators.http import require_GET

from google_auth_oauthlib.flow import Flow

from .models import CalendarCredential

SCOPES = ["https://www.googleapis.com/auth/calendar"]


def _client_config():
    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET or not settings.GOOGLE_REDIRECT_URI:
        raise RuntimeError("Faltan GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_REDIRECT_URI en .env.calendar (o .env).")

    return {
        "web": {
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "redirect_uris": [settings.GOOGLE_REDIRECT_URI],
        }
    }


def _credential_name(request) -> str:
    """
    Si quieres credenciales por negocio:
      /api/google/auth-url/?negocio_id=3  -> guarda nombre="negocio_3"
    Si no, usa "default".
    """
    negocio_id = request.GET.get("negocio_id")
    if negocio_id:
        return f"negocio_{negocio_id}"
    return request.GET.get("nombre", "default")


@require_GET
def google_calendar_auth_url(request):
    flow = Flow.from_client_config(_client_config(), scopes=SCOPES)
    flow.redirect_uri = settings.GOOGLE_REDIRECT_URI

    authorization_url, state = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="consent",
    )

    request.session["google_oauth_state"] = state
    request.session["google_cred_name"] = _credential_name(request)

    return JsonResponse({
        "authorization_url": authorization_url,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "credential_name": request.session["google_cred_name"],
    })


@require_GET
def google_calendar_callback(request):
    code = request.GET.get("code")
    if not code:
        return HttpResponseBadRequest("Missing 'code' in query params.")

    flow = Flow.from_client_config(_client_config(), scopes=SCOPES)
    flow.redirect_uri = settings.GOOGLE_REDIRECT_URI
    flow.fetch_token(code=code)

    creds = flow.credentials

    data = {
        "token": creds.token,
        "refresh_token": creds.refresh_token,
        "token_uri": creds.token_uri,
        "client_id": creds.client_id,
        "client_secret": creds.client_secret,
        "scopes": creds.scopes,
    }

    nombre = request.session.get("google_cred_name") or _credential_name(request)
    calendar_id = settings.GOOGLE_CALENDAR_ID or "primary"

    obj, _ = CalendarCredential.objects.update_or_create(
        nombre=nombre,
        defaults={
            "calendar_id": calendar_id,
            "credentials_json": json.loads(json.dumps(data)),
        },
    )

    return JsonResponse({
        "ok": True,
        "message": "Google Calendar conectado. Credenciales guardadas en BD (CalendarCredential).",
        "credential": {"id": obj.id, "nombre": obj.nombre, "calendar_id": obj.calendar_id},
    })
