from datetime import date, time

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import Cliente, Servicio, Negocio
from .serializers import CitaSerializer
from .utils import suggest_slot


def _get_or_create_cliente(negocio: Negocio, nombre: str, email: str = "", telefono: str = "") -> Cliente:
    cliente, _ = Cliente.objects.get_or_create(
        negocio=negocio,
        email=email,
        defaults={"nombre": nombre, "telefono": telefono},
    )
    # Si existe con email vacío, intenta empatar por teléfono
    if not email and telefono:
        cliente, _ = Cliente.objects.get_or_create(
            negocio=negocio,
            telefono=telefono,
            defaults={"nombre": nombre, "email": email},
        )
    return cliente


@api_view(["POST"])
@permission_classes([AllowAny])
def crear_cita_publica(request):
    """
    Endpoint público para que clientes reserven.
    Crea el cliente si no existe y usa las validaciones estándar de CitaSerializer.
    """
    data = request.data
    negocio_id = data.get("negocio")
    servicio_id = data.get("servicio")
    nombre = data.get("nombre")
    email = data.get("email", "")
    telefono = data.get("telefono", "")
    fecha = data.get("fecha")
    hora_inicio = data.get("hora_inicio")
    hora_fin = data.get("hora_fin")
    notas = data.get("notas", "")

    if not all([negocio_id, servicio_id, nombre, fecha, hora_inicio, hora_fin]):
        return Response({"detail": "Faltan campos obligatorios."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        negocio = Negocio.objects.get(pk=negocio_id, activo=True)
    except Negocio.DoesNotExist:
        return Response({"detail": "Negocio no encontrado o inactivo."}, status=status.HTTP_404_NOT_FOUND)

    try:
        servicio = Servicio.objects.get(pk=servicio_id, activo=True)
    except Servicio.DoesNotExist:
        return Response({"detail": "Servicio no encontrado o inactivo."}, status=status.HTTP_404_NOT_FOUND)

    cliente = _get_or_create_cliente(
        negocio=negocio,
        nombre=nombre,
        email=email,
        telefono=telefono,
    )

    payload = {
        "negocio": negocio.id,
        "servicio": servicio.id,
        "cliente": cliente.id,
        "fecha": fecha,
        "hora_inicio": hora_inicio,
        "hora_fin": hora_fin,
        "estado": data.get("estado", "confirmada"),
        "notas": notas,
    }

    # Si no envían hora_fin, calcúlala con la duración del servicio
    if not payload["hora_fin"]:
        try:
            h_ini = time.fromisoformat(payload["hora_inicio"])
        except ValueError:
            return Response({"detail": "Hora inicio inválida."}, status=status.HTTP_400_BAD_REQUEST)
        minutes = servicio.duracion_minutos or 60
        fin_min = h_ini.hour * 60 + h_ini.minute + minutes
        payload["hora_fin"] = time(fin_min // 60, fin_min % 60).isoformat(timespec="minutes")

    serializer = CitaSerializer(data=payload)
    if serializer.is_valid():
        cita = serializer.save()
        return Response(
            {
                "detail": "Cita creada",
                "cita_id": cita.id,
                "fecha": cita.fecha,
                "hora_inicio": cita.hora_inicio,
                "hora_fin": cita.hora_fin,
            },
            status=status.HTTP_201_CREATED,
        )

    # Si no es válido, intenta sugerir un hueco
    suggestion = suggest_slot(
        servicio=servicio,
        fecha_desde=date.fromisoformat(fecha),
        duracion_minutos=None,
        prefer_hora=time.fromisoformat(hora_inicio),
    )
    response_data = {"errors": serializer.errors}
    if suggestion:
        response_data["sugerencia"] = {
            "fecha": suggestion.fecha,
            "hora_inicio": suggestion.hora_inicio.strftime("%H:%M"),
            "hora_fin": suggestion.hora_fin.strftime("%H:%M"),
            "razon": suggestion.razon,
        }

    return Response(response_data, status=status.HTTP_400_BAD_REQUEST)
