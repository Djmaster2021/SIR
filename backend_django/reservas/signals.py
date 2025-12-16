from datetime import datetime

from django.core.mail import send_mail
from django.db import transaction
from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from .models import Cita
from .google_sync import delete_cita_from_calendar, sync_cita_to_calendar


def _build_subject(cita: Cita, created: bool) -> str:
    accion = "Confirmación" if created else "Actualización"
    return f"{accion} de cita – {cita.negocio.nombre}"


def _build_body(cita: Cita) -> str:
    fecha_str = cita.fecha.strftime("%Y-%m-%d")
    return (
        f"Hola {cita.cliente.nombre},\n\n"
        f"Tu cita en {cita.negocio.nombre} está registrada.\n"
        f"Servicio: {cita.servicio.nombre}\n"
        f"Fecha: {fecha_str}\n"
        f"Horario: {cita.hora_inicio.strftime('%H:%M')} - {cita.hora_fin.strftime('%H:%M')}\n"
        f"Estado: {cita.estado}\n"
        f"Notas: {cita.notas or 'Sin notas'}\n\n"
        f"Generado: {datetime.now().strftime('%Y-%m-%d %H:%M')}"
    )


def _should_skip_for_internal_update(update_fields) -> bool:
    """
    Si el save fue solo para campos internos, no mandamos correo ni resincronizamos.
    """
    if not update_fields:
        return False
    update_fields = set(update_fields)
    internal_only = {"event_id", "recordatorio_enviado"}
    return update_fields.issubset(internal_only)


@receiver(post_save, sender=Cita)
def enviar_notificacion_cita(sender, instance: Cita, created: bool, **kwargs):
    """
    Envía correo a cliente/propietario (si tienen email) y sincroniza con Google Calendar.
    """
    if kwargs.get("raw"):
        return

    if _should_skip_for_internal_update(kwargs.get("update_fields")):
        return

    def _after_commit():
        # 1) Correo (si hay destinatarios)
        destinatarios = []
        if instance.cliente.email:
            destinatarios.append(instance.cliente.email)
        if instance.negocio.propietario.email:
            destinatarios.append(instance.negocio.propietario.email)

        if destinatarios:
            send_mail(
                subject=_build_subject(instance, created),
                message=_build_body(instance),
                from_email=None,  # usa DEFAULT_FROM_EMAIL
                recipient_list=destinatarios,
                fail_silently=True,
            )

        # 2) Calendar sync (si hay credenciales guardadas)
        sync_cita_to_calendar(instance)

    # Ejecutar después de confirmar commit DB
    transaction.on_commit(_after_commit)


@receiver(post_delete, sender=Cita)
def eliminar_evento_calendar(sender, instance: Cita, **kwargs):
    """
    Borra el evento remoto cuando se elimina la cita.
    """
    delete_cita_from_calendar(instance)
