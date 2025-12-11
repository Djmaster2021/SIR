from django.apps import AppConfig


class ReservasConfig(AppConfig):
    name = 'reservas'

    def ready(self):
        # Importa señales al iniciar la app
        from . import signals  # noqa: F401
