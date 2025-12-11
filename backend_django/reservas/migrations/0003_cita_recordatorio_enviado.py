from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("reservas", "0002_mesa"),
    ]

    operations = [
        migrations.AddField(
            model_name="cita",
            name="recordatorio_enviado",
            field=models.BooleanField(default=False),
        ),
    ]
