from datetime import timedelta

from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.utils import timezone

from reservas.models import Cita


class Command(BaseCommand):
    help = "Envía recordatorios de citas para las próximas 24 horas a clientes con email."

    def add_arguments(self, parser):
        parser.add_argument(
            "--horas",
            type=int,
            default=24,
            help="Ventana de horas hacia adelante para enviar recordatorios (default 24).",
        )

    def handle(self, *args, **options):
        ahora = timezone.localtime()
        limite = ahora + timedelta(hours=options["horas"])

        citas = Cita.objects.filter(
            estado__in=("pendiente", "confirmada"),
            fecha__gte=ahora.date(),
            fecha__lte=limite.date(),
            recordatorio_enviado=False,
            cliente__email__isnull=False,
        ).select_related("cliente", "servicio", "negocio")

        enviados = 0
        for cita in citas:
            # Si la cita es hoy, validamos la hora inicio en ventana
            if cita.fecha == ahora.date():
                if cita.hora_inicio <= ahora.time():
                    continue

            send_mail(
                subject=f"Recordatorio: cita en {cita.negocio.nombre}",
                message=(
                    f"Hola {cita.cliente.nombre},\n\n"
                    f"Te recordamos tu cita:\n"
                    f"- Negocio: {cita.negocio.nombre}\n"
                    f"- Servicio: {cita.servicio.nombre}\n"
                    f"- Fecha: {cita.fecha}\n"
                    f"- Hora: {cita.hora_inicio.strftime('%H:%M')} - {cita.hora_fin.strftime('%H:%M')}\n\n"
                    "Si necesitas reprogramar o cancelar, responde a este correo o usa el panel."
                ),
                from_email=None,
                recipient_list=[cita.cliente.email],
                fail_silently=True,
            )
            cita.recordatorio_enviado = True
            cita.save(update_fields=["recordatorio_enviado"])
            enviados += 1

        self.stdout.write(self.style.SUCCESS(f"Recordatorios enviados: {enviados}"))
