from django.db import models
from django.contrib.auth.models import User


class Negocio(models.Model):
    nombre = models.CharField(max_length=150)
    propietario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='negocios')
    direccion = models.CharField(max_length=255, blank=True)
    telefono = models.CharField(max_length=20, blank=True)
    email_contacto = models.EmailField(blank=True)
    activo = models.BooleanField(default=True)
    creado_en = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nombre


class Servicio(models.Model):
    negocio = models.ForeignKey(Negocio, on_delete=models.CASCADE, related_name='servicios')
    nombre = models.CharField(max_length=150)
    descripcion = models.TextField(blank=True)
    duracion_minutos = models.PositiveIntegerField(default=30)
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    activo = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.nombre} ({self.negocio.nombre})"


class Cliente(models.Model):
    negocio = models.ForeignKey(Negocio, on_delete=models.CASCADE, related_name='clientes')
    nombre = models.CharField(max_length=150)
    email = models.EmailField(blank=True)
    telefono = models.CharField(max_length=20, blank=True)
    creado_en = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.nombre} - {self.negocio.nombre}"
class Mesa(models.Model):
    TIPO_CHOICES = [
        ("normal_2", "Normal 2 personas"),
        ("normal_4", "Normal 4 personas"),
        ("vip_2", "VIP 2 personas"),
        ("vip_grande", "VIP 5-12 personas"),
    ]

    negocio = models.ForeignKey(Negocio, on_delete=models.CASCADE, related_name="mesas")
    servicio = models.ForeignKey(Servicio, on_delete=models.PROTECT, related_name="mesas")
    nombre = models.CharField(max_length=50)  # "Mesa 1", "VIP-3", etc.
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
    capacidad_min = models.PositiveIntegerField(default=1)
    capacidad_max = models.PositiveIntegerField(default=2)
    activa = models.BooleanField(default=True)

    class Meta:
        unique_together = ("negocio", "nombre")
        ordering = ["negocio", "nombre"]

    def __str__(self):
        return f"{self.nombre} ({self.negocio.nombre})"


class Cita(models.Model):
    ESTADO_CHOICES = [
        ('pendiente', 'Pendiente'),
        ('confirmada', 'Confirmada'),
        ('cancelada', 'Cancelada'),
        ('completada', 'Completada'),
        ('no_asistio', 'No asistió'),
    ]

    negocio = models.ForeignKey(Negocio, on_delete=models.CASCADE, related_name='citas')
    servicio = models.ForeignKey(Servicio, on_delete=models.PROTECT, related_name='citas')
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE, related_name='citas')
    fecha = models.DateField()
    hora_inicio = models.TimeField()
    hora_fin = models.TimeField()
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='pendiente')
    notas = models.TextField(blank=True)
    creado_en = models.DateTimeField(auto_now_add=True)
    recordatorio_enviado = models.BooleanField(default=False)

    class Meta:
        unique_together = ('negocio', 'fecha', 'hora_inicio', 'servicio', 'cliente')

    def __str__(self):
        return f"{self.cliente.nombre} - {self.servicio.nombre} ({self.fecha} {self.hora_inicio})"
