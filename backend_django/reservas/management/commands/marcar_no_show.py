from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from reservas.models import Cita


TOLERANCIA_MINUTOS = 15


class Command(BaseCommand):
    help = "Marca como no_asistio las citas confirmadas/pendientes que excedieron la tolerancia de llegada."

    def handle(self, *args, **options):
        ahora = timezone.localtime()
        limite = (ahora - timedelta(minutes=TOLERANCIA_MINUTOS)).time()

        qs = Cita.objects.filter(
            estado__in=("pendiente", "confirmada"),
            fecha__lte=ahora.date(),
            hora_inicio__lt=limite,
        )

        actualizadas = qs.update(estado="no_asistio")
        self.stdout.write(self.style.SUCCESS(f"Citas marcadas como no_asistio: {actualizadas}"))
