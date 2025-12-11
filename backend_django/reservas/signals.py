from datetime import datetime

from django.core.mail import send_mail
from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Cita


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


@receiver(post_save, sender=Cita)
def enviar_notificacion_cita(sender, instance: Cita, created, **kwargs):
    """
    Envía correo de confirmación/actualización a cliente y propietario si tienen email.
    """
    destinatarios = []
    if instance.cliente.email:
        destinatarios.append(instance.cliente.email)
    if instance.negocio.propietario.email:
        destinatarios.append(instance.negocio.propietario.email)

    if not destinatarios:
        return

    send_mail(
        subject=_build_subject(instance, created),
        message=_build_body(instance),
        from_email=None,  # usa DEFAULT_FROM_EMAIL
        recipient_list=destinatarios,
        fail_silently=True,  # no romper flujo de API si falla el correo
    )
