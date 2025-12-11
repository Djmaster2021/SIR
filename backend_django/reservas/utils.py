from __future__ import annotations

from dataclasses import dataclass
from datetime import date, time, timedelta
from typing import Optional

from .models import Cita, Mesa, Servicio


OPEN_TIME = time(13, 0)
CLOSE_TIME = time(23, 0)
STEP_MINUTES = 15
TOLERANCIA_LLEGADA_MINUTOS = 15  # ventana de llegada antes de marcar no_show (gestiona el comando marcar_no_show)


def _to_minutes(t: time) -> int:
    return t.hour * 60 + t.minute


def _to_time(minutes: int) -> time:
    return time(minutes // 60, minutes % 60)


@dataclass
class SlotSuggestion:
    fecha: date
    hora_inicio: time
    hora_fin: time
    razon: str


def suggest_slot(
    servicio: Servicio,
    fecha_desde: Optional[date] = None,
    duracion_minutos: Optional[int] = None,
    prefer_hora: Optional[time] = None,
    dias_hacia_adelante: int = 30,
) -> Optional[SlotSuggestion]:
    """
    Heurística para sugerir el mejor horario disponible:
    - Busca en intervalos de 15 minutos entre 13:00 y 23:00.
    - Respeta número de mesas activas por servicio (capacidad de concurrencia).
    - Minimiza tiempos muertos (gap antes + gap después) y, si hay preferencia, penaliza lejanía a la hora preferida.
    - Recorre desde fecha_desde hasta +dias_hacia_adelante.
    """
    fecha_base = fecha_desde or date.today()
    duracion = duracion_minutos or servicio.duracion_minutos or 60
    prefer_min = _to_minutes(prefer_hora) if prefer_hora else None

    open_min = _to_minutes(OPEN_TIME)
    close_min = _to_minutes(CLOSE_TIME)

    mesas_activas = Mesa.objects.filter(servicio=servicio, activa=True).count()
    if mesas_activas == 0:
        return None

    for offset in range(dias_hacia_adelante + 1):
        dia = fecha_base + timedelta(days=offset)
        # Solo citas activas para validar disponibilidad
        citas = Cita.objects.filter(
            servicio=servicio,
            fecha=dia,
            estado__in=("pendiente", "confirmada"),
        ).values_list("hora_inicio", "hora_fin")

        bookings = [
            (_to_minutes(h_ini), _to_minutes(h_fin))
            for h_ini, h_fin in citas
        ]

        best_score = None
        best_slot = None

        # Última hora de inicio permitida para que termine antes de cierre
        last_start = close_min - duracion
        if last_start < open_min:
            continue

        for start in range(open_min, last_start + 1, STEP_MINUTES):
            end = start + duracion

            # Verificar concurrencia con mesas activas
            overlaps = sum(1 for h_ini, h_fin in bookings if not (h_fin <= start or h_ini >= end))
            if overlaps >= mesas_activas:
                continue

            # Buscar huecos inmediatos para minimizar tiempos muertos
            prev_end = max((h_fin for h_ini, h_fin in bookings if h_fin <= start), default=open_min)
            next_start = min((h_ini for h_ini, h_fin in bookings if h_ini >= end), default=close_min)
            idle_before = start - prev_end
            idle_after = next_start - end
            score = idle_before + idle_after

            if prefer_min is not None:
                score += abs(start - prefer_min) * 0.5

            if best_score is None or score < best_score:
                best_score = score
                best_slot = (start, end)

        if best_slot:
            start_min, end_min = best_slot
            razon = "Hueco elegido para minimizar tiempos muertos"
            if prefer_min is not None:
                razon += " y acercar a la hora preferida"
            return SlotSuggestion(
                fecha=dia,
                hora_inicio=_to_time(start_min),
                hora_fin=_to_time(end_min),
                razon=razon,
            )

    return None


def available_slots(servicio: Servicio, fecha: date, duracion_minutos: Optional[int] = None):
    """
    Devuelve lista de slots disponibles (hora_inicio, hora_fin) para un servicio/fecha,
    usando step de 15 minutos y considerando mesas activas y solapes.
    """
    # Jueves cerrado
    if fecha.weekday() == 3:  # 0=Lunes ... 3=Jueves
        return []

    duracion = duracion_minutos or servicio.duracion_minutos or 60
    open_min = _to_minutes(OPEN_TIME)
    close_min = _to_minutes(CLOSE_TIME)
    mesas_activas = Mesa.objects.filter(servicio=servicio, activa=True).count()
    if mesas_activas == 0:
        return []

    bookings = [
        (_to_minutes(h_ini), _to_minutes(h_fin))
        for h_ini, h_fin in Cita.objects.filter(
            servicio=servicio,
            fecha=fecha,
            estado__in=("pendiente", "confirmada"),
        ).values_list("hora_inicio", "hora_fin")
    ]

    last_start = close_min - duracion
    if last_start < open_min:
        return []

    slots = []
    for start in range(open_min, last_start + 1, STEP_MINUTES):
        end = start + duracion
        overlaps = sum(1 for h_ini, h_fin in bookings if not (h_fin <= start or h_ini >= end))
        if overlaps >= mesas_activas:
            continue
        slots.append((_to_time(start), _to_time(end)))

    return slots
