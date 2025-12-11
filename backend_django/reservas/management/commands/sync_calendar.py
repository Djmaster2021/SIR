from django.core.management.base import BaseCommand

from reservas.google_sync import resync_calendar_events


class Command(BaseCommand):
    help = "Resincroniza citas futuras con Google Calendar (crea las que falten y actualiza cambios)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--limit",
            type=int,
            default=200,
            help="Máximo de citas a procesar en esta ejecución (por defecto 200).",
        )

    def handle(self, *args, **options):
        creados, actualizados = resync_calendar_events(limit=options["limit"])

        if creados == actualizados == 0:
            self.stdout.write(self.style.WARNING("Sin acciones realizadas (¿faltan credenciales?)."))
            return

        self.stdout.write(
            self.style.SUCCESS(
                f"Resync completado. Eventos creados: {creados}. Eventos actualizados: {actualizados}."
            )
        )
