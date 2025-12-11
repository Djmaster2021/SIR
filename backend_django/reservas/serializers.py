# reservas/serializers.py
from datetime import date, time

from rest_framework import serializers
from .models import Negocio, Servicio, Cliente, Cita


class NegocioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Negocio
        fields = [
            "id",
            "nombre",
            "propietario",
            "direccion",
            "telefono",
            "email_contacto",
            "activo",
            "creado_en",
        ]
        read_only_fields = ["id", "creado_en"]


class ServicioSerializer(serializers.ModelSerializer):
    negocio_nombre = serializers.CharField(source="negocio.nombre", read_only=True)

    class Meta:
        model = Servicio
        fields = [
            "id",
            "negocio",
            "negocio_nombre",
            "nombre",
            "descripcion",
            "duracion_minutos",
            "precio",
            "activo",
        ]
        read_only_fields = ["id"]


class ClienteSerializer(serializers.ModelSerializer):
    negocio_nombre = serializers.CharField(source="negocio.nombre", read_only=True)

    class Meta:
        model = Cliente
        fields = [
            "id",
            "negocio",
            "negocio_nombre",
            "nombre",
            "email",
            "telefono",
            "creado_en",
        ]
        read_only_fields = ["id", "creado_en"]


class CitaSerializer(serializers.ModelSerializer):
    negocio_nombre = serializers.CharField(source="negocio.nombre", read_only=True)
    servicio_nombre = serializers.CharField(source="servicio.nombre", read_only=True)
    cliente_nombre = serializers.CharField(source="cliente.nombre", read_only=True)

    class Meta:
        model = Cita
        fields = [
            "id",
            "negocio",
            "negocio_nombre",
            "servicio",
            "servicio_nombre",
            "cliente",
            "cliente_nombre",
            "fecha",
            "hora_inicio",
            "hora_fin",
            "estado",
            "notas",
            "creado_en",
        ]
        read_only_fields = ["id", "creado_en"]

    def validate(self, attrs):
        """
        Reglas de negocio para las citas:
        - fecha >= hoy
        - hora_fin > hora_inicio
        - horario dentro de apertura/cierre
        - un cliente no puede tener más de UNA cita activa futura
        """

        instancia = self.instance

        fecha = attrs.get("fecha") or (instancia.fecha if instancia else None)
        hora_inicio = attrs.get("hora_inicio") or (instancia.hora_inicio if instancia else None)
        hora_fin = attrs.get("hora_fin") or (instancia.hora_fin if instancia else None)
        cliente = attrs.get("cliente") or (instancia.cliente if instancia else None)
        estado = attrs.get("estado") or (instancia.estado if instancia else None)

        # 1) Fecha no puede ser pasada
        if fecha and fecha < date.today():
            raise serializers.ValidationError(
                "La fecha de la cita no puede ser anterior a hoy."
            )

        # 2) Hora fin > hora inicio
        if hora_inicio and hora_fin and hora_fin <= hora_inicio:
            raise serializers.ValidationError(
                "La hora de fin debe ser mayor que la hora de inicio."
            )

        # 3) Horario permitido del restaurante
        apertura = time(13, 0)  # 13:00
        cierre = time(23, 0)    # 23:00

        if hora_inicio and not (apertura <= hora_inicio < cierre):
            raise serializers.ValidationError(
                f"La hora de inicio debe estar entre {apertura.strftime('%H:%M')} y {cierre.strftime('%H:%M')}."
            )

        if hora_fin and not (apertura < hora_fin <= cierre):
            raise serializers.ValidationError(
                f"La hora de fin debe estar entre {apertura.strftime('%H:%M')} y {cierre.strftime('%H:%M')}."
            )

        # 4) Un cliente no puede tener más de UNA cita activa futura
        #    (pendiente / confirmada y con fecha hoy o mayor)
        estados_activos = ("pendiente", "confirmada")

        if cliente and fecha and estado in estados_activos and fecha >= date.today():
            qs = Cita.objects.filter(
                cliente=cliente,
                fecha__gte=date.today(),
                estado__in=estados_activos,
            )
            if instancia:
                qs = qs.exclude(pk=instancia.pk)

            if qs.exists():
                raise serializers.ValidationError(
                    "Este cliente ya tiene una cita activa. No puede registrar otra."
                )

        return attrs
