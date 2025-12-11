from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("reservas", "0003_cita_recordatorio_enviado"),
    ]

    operations = [
        migrations.AddField(
            model_name="cita",
            name="event_id",
            field=models.CharField(blank=True, max_length=150, null=True),
        ),
        migrations.CreateModel(
            name="CalendarCredential",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("nombre", models.CharField(default="default", max_length=150)),
                ("calendar_id", models.CharField(default="primary", max_length=255)),
                ("credentials_json", models.JSONField()),
                ("creado_en", models.DateTimeField(auto_now_add=True)),
                ("actualizado_en", models.DateTimeField(auto_now=True)),
            ],
        ),
    ]
