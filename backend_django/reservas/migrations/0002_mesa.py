from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("reservas", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="Mesa",
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
                ("nombre", models.CharField(max_length=50)),
                (
                    "tipo",
                    models.CharField(
                        choices=[
                            ("normal_2", "Normal 2 personas"),
                            ("normal_4", "Normal 4 personas"),
                            ("vip_2", "VIP 2 personas"),
                            ("vip_grande", "VIP 5-12 personas"),
                        ],
                        max_length=20,
                    ),
                ),
                ("capacidad_min", models.PositiveIntegerField(default=1)),
                ("capacidad_max", models.PositiveIntegerField(default=2)),
                ("activa", models.BooleanField(default=True)),
                (
                    "negocio",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="mesas",
                        to="reservas.negocio",
                    ),
                ),
                (
                    "servicio",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="mesas",
                        to="reservas.servicio",
                    ),
                ),
            ],
            options={
                "ordering": ["negocio", "nombre"],
                "unique_together": {("negocio", "nombre")},
            },
        ),
    ]
