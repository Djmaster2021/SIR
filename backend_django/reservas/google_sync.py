import json
import logging
from datetime import datetime
from typing import Tuple

from django.conf import settings
from django.utils import timezone

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

from .models import CalendarCredential, Cita

logger = logging.getLogger(__name__)


def _get_credentials() -> Credentials | None:
    cred_obj = CalendarCredential.objects.first()
    if not cred_obj:
        logger.debug("No hay credenciales de Calendar almacenadas.")
        return None

    data = cred_obj.credentials_json
    creds = Credentials.from_authorized_user_info(data, scopes=["https://www.googleapis.com/auth/calendar"])
    if creds.expired and creds.refresh_token:
        try:
            creds.refresh(Request())
            # persist refreshed token
            cred_obj.credentials_json = json.loads(creds.to_json())
            cred_obj.save(update_fields=["credentials_json", "actualizado_en"])
        except Exception as exc:  # noqa: BLE001
            logger.warning("No se pudo refrescar token de Calendar: %s", exc)
            return None
    return creds


def _get_service() -> Tuple[object | None, str | None]:
    """
    Devuelve (service, calendar_id). Si faltan credenciales retorna (None, None).
    """
    creds = _get_credentials()
    if not creds:
        return None, None

    service = build("calendar", "v3", credentials=creds, cache_discovery=False)
    cred_obj = CalendarCredential.objects.first()
    calendar_id = (cred_obj.calendar_id if cred_obj else None) or settings.GOOGLE_CALENDAR_ID
    return service, calendar_id


def _local_datetime(fecha, hora):
    naive = datetime.combine(fecha, hora)
    tzinfo = timezone.get_default_timezone()
    return timezone.make_aware(naive, tzinfo)


def _build_event_body(cita: Cita) -> dict:
    start_dt = _local_datetime(cita.fecha, cita.hora_inicio)
    end_dt = _local_datetime(cita.fecha, cita.hora_fin)
    tz_name = settings.TIME_ZONE

    return {
        "summary": f"Cita: {cita.servicio.nombre} - {cita.cliente.nombre}",
        "description": cita.notas or "",
        "start": {"dateTime": start_dt.isoformat(), "timeZone": tz_name},
        "end": {"dateTime": end_dt.isoformat(), "timeZone": tz_name},
        "attendees": [{"email": cita.cliente.email}] if cita.cliente.email else [],
    }


def sync_cita_to_calendar(cita: Cita):
    service, calendar_id = _get_service()
    if not service:
        return

    event_body = _build_event_body(cita)

    try:
        if cita.event_id:
            try:
                service.events().update(calendarId=calendar_id, eventId=cita.event_id, body=event_body).execute()
                return
            except HttpError as exc:
                status = getattr(exc, "status_code", None) or getattr(getattr(exc, "resp", None), "status", None)
                if status != 404:
                    logger.warning("Error al actualizar evento %s: %s", cita.event_id, exc)
                    return
                # 404: el evento fue borrado en Calendar, creamos uno nuevo
                logger.info("Evento %s inexistente en Calendar; se recreará.", cita.event_id)

        created = service.events().insert(calendarId=calendar_id, body=event_body, sendUpdates="all").execute()
        cita.event_id = created.get("id")
        cita.save(update_fields=["event_id"])
    except Exception as exc:  # noqa: BLE001
        logger.warning("No se pudo sincronizar cita %s con Calendar: %s", cita.id, exc)


def delete_cita_from_calendar(cita: Cita):
    if not cita.event_id:
        return
    service, calendar_id = _get_service()
    if not service:
        return
    try:
        service.events().delete(calendarId=calendar_id, eventId=cita.event_id).execute()
    except Exception as exc:  # noqa: BLE001
        logger.warning("No se pudo eliminar evento de Calendar para cita %s: %s", cita.id, exc)


def resync_calendar_events(limit: int = 200, service=None, calendar_id: str | None = None) -> tuple[int, int]:
    """
    Recorre citas futuras y garantiza que existan/estén actualizadas en Calendar.

    Devuelve (creados, actualizados).
    """
    if service is None or calendar_id is None:
        service, calendar_id = _get_service()
    if not service:
        return 0, 0

    hoy = timezone.localdate()
    citas = (
        Cita.objects.filter(fecha__gte=hoy)
        .select_related("cliente", "servicio")
        .order_by("fecha", "hora_inicio")[:limit]
    )

    creados = actualizados = 0
    for cita in citas:
        event_body = _build_event_body(cita)
        try:
            if cita.event_id:
                try:
                    # Si existe, actualizamos para reflejar cambios locales
                    service.events().get(calendarId=calendar_id, eventId=cita.event_id).execute()
                    service.events().update(calendarId=calendar_id, eventId=cita.event_id, body=event_body).execute()
                    actualizados += 1
                    continue
                except HttpError as exc:
                    status = getattr(exc, "status_code", None) or getattr(getattr(exc, "resp", None), "status", None)
                    if status != 404:
                        logger.warning("No se pudo actualizar cita %s: %s", cita.id, exc)
                        continue
                    logger.info("Evento %s no existe, se creará uno nuevo.", cita.event_id)

            created = service.events().insert(calendarId=calendar_id, body=event_body, sendUpdates="all").execute()
            cita.event_id = created.get("id")
            cita.save(update_fields=["event_id"])
            creados += 1
        except Exception as exc:  # noqa: BLE001
            logger.warning("No se pudo resync cita %s: %s", cita.id, exc)

    return creados, actualizados


def calendar_status() -> dict:
    """
    Devuelve estado básico de la integración con Calendar.
    """
    cred_obj = CalendarCredential.objects.first()
    creds = _get_credentials()

    status = {
        "authorized": bool(creds),
        "calendar_id": (cred_obj.calendar_id if cred_obj else None) or settings.GOOGLE_CALENDAR_ID,
        "updated_at": cred_obj.actualizado_en if cred_obj else None,
    }

    if creds:
        status.update(
            {
                "token_expiry": creds.expiry,
                "scopes": creds.scopes,
            }
        )

    return status
