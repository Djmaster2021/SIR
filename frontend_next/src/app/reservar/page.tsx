/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { apiUrl } from "@/lib/api";
import { Lang, normalizeLang, withLangParam } from "@/lib/lang";

type Negocio = { id: number; nombre: string };
type Servicio = { id: number; nombre: string; negocio: number; precio?: number };
type Slot = { hora_inicio: string; hora_fin: string };
type Sugerencia = { fecha: string; hora_inicio: string; hora_fin: string; razon: string };
type MesaTipo = { id: string; nombre: string; capacidad: number; total: number; ocupadas: number; precio: number };
type MesaApi = {
  id: number;
  nombre: string;
  tipo: string | null;
  capacidad_min: number;
  capacidad_max: number;
  servicio: number;
  negocio: number;
  activa: boolean;
};

const CLOSED_WEEKDAY = -1; // -1 => sin cierre fijo
const fallbackNegocios: Negocio[] = [{ id: 1, nombre: "Restaurante El Mirador" }];
const fallbackServicios: Servicio[] = [
  { id: 1, nombre: "Mesa para 2", negocio: 1 },
  { id: 2, nombre: "Mesa para 4", negocio: 1 },
  { id: 3, nombre: "Mesa VIP", negocio: 1 },
  { id: 4, nombre: "Mesa cumpleaños 10+", negocio: 1 },
];

// ======================
// Helpers de fecha/hora (timezone-safe)
// ======================

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toISODateLocal(date: Date) {
  // YYYY-MM-DD (local)
  const y = date.getFullYear();
  const m = pad2(date.getMonth() + 1);
  const d = pad2(date.getDate());
  return `${y}-${m}-${d}`;
}

function parseLocalDate(dateStr: string) {
  // "YYYY-MM-DD" -> Date local (NO UTC)
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1, 0, 0, 0, 0);
}

function formatDatePretty(dateStr: string, locale: string) {
  const d = parseLocalDate(dateStr);
  return d.toLocaleDateString(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "2-digit",
  });
}

function normalizeHHMM(h: string) {
  // "13:00:00" -> "13:00"
  if (!h) return "";
  return h.slice(0, 5);
}

function isSlotPast(dateStr: string, startHHMM: string, toleranceMin = 15) {
  // Si es hoy (o cualquier día), compara contra now+tolerancia
  const [hh, mm] = normalizeHHMM(startHHMM).split(":").map(Number);
  const d = parseLocalDate(dateStr);
  d.setHours(hh ?? 0, mm ?? 0, 0, 0);

  const now = new Date();
  now.setMinutes(now.getMinutes() + toleranceMin);

  return d.getTime() <= now.getTime();
}

function daysInMonth(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const pad = firstDay.getDay();

  const days: Date[] = [];
  for (let i = 0; i < pad; i++) {
    days.push(new Date(year, month, i - pad + 1));
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }
  return days;
}

function getSlotEnd(selectedSlot: string, slots: Slot[], fallbackSlots: Slot[]) {
  const slot =
    slots.find((s) => normalizeHHMM(s.hora_inicio) === normalizeHHMM(selectedSlot)) ||
    fallbackSlots.find((s) => normalizeHHMM(s.hora_inicio) === normalizeHHMM(selectedSlot));
  return slot?.hora_fin ? normalizeHHMM(slot.hora_fin) : null;
}

function monthKey(d: Date) {
  return d.getFullYear() * 12 + d.getMonth();
}

function inferMesaKeysFromServicio(servicio?: Servicio): string[] {
  if (!servicio) return [];
  const n = (servicio.nombre || "").toLowerCase();

  // ✅ Si el servicio es VIP, solo queremos VIP
  if (n.includes("vip")) {
    // si es VIP 2 explícito
    if (n.includes("2")) return ["vip_2"];
    // si es VIP grande explícito
    if (n.includes("5") || n.includes("12") || n.includes("grande")) return ["vip_grande"];
    // si es solo "VIP", mostramos ambos VIP
    return ["vip_2", "vip_grande"];
  }

  // cumple
  if (n.includes("cumple")) return ["cumple_10"];

  // normales
  if (n.includes("para 4") || n.includes("4")) return ["normal_4"];
  if (n.includes("para 2") || n.includes("2")) return ["normal_2"];

  return [];
}

function matchMesaByName(mesaNombre: string, keys: string[]) {
  const name = (mesaNombre || "").toLowerCase();

  if (keys.includes("cumple_10") && name.includes("cumple")) return true;

  // VIP grande
  if (keys.includes("vip_grande") && name.includes("vip") && (name.includes("5") || name.includes("12") || name.includes("grande"))) {
    return true;
  }

  // VIP 2
  if (keys.includes("vip_2") && name.includes("vip") && (name.includes(" 2") || name.includes("vip 2") || name.includes("2 "))) {
    return true;
  }

  // normales
  if (keys.includes("normal_4") && (name.includes("4") || name.includes("para 4"))) return true;
  if (keys.includes("normal_2") && (name.includes("2") || name.includes("para 2"))) return true;

  return false;
}

export default function ReservarPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [lang, setLang] = useState<Lang>(() => normalizeLang(searchParams.get("lang")));
  const [negocios, setNegocios] = useState<Negocio[]>(fallbackNegocios);
  const [servicios, setServicios] = useState<Servicio[]>(fallbackServicios);

  const todayISO = useMemo(() => toISODateLocal(new Date()), []);
  const maxISO = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return toISODateLocal(d);
  }, []);

  const [selectedMesaId, setSelectedMesaId] = useState<string>("");
  const [selectedNegocio, setSelectedNegocio] = useState<string>(String(fallbackNegocios[0].id));
  const [selectedServicio, setSelectedServicio] = useState<string>(String(fallbackServicios[0].id));
  const [selectedDate, setSelectedDate] = useState<string>(todayISO);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [sugerencia, setSugerencia] = useState<Sugerencia | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [monthView, setMonthView] = useState<Date>(parseLocalDate(todayISO));
  const [overlay, setOverlay] = useState<
    | {
        title: string;
        description?: string;
        tone?: "success" | "info" | "error";
      }
    | null
  >(null);

  const mesaDefault: MesaTipo[] = useMemo(
    () => [
      { id: "normal_2", nombre: "Mesa 2 personas", capacidad: 2, total: 10, ocupadas: 5, precio: 0 },
      { id: "normal_4", nombre: "Mesa 4 personas", capacidad: 4, total: 8, ocupadas: 3, precio: 0 },
      { id: "vip_grande", nombre: "Mesa VIP 5-12", capacidad: 12, total: 5, ocupadas: 2, precio: 500 },
      { id: "vip_2", nombre: "Mesa VIP 2", capacidad: 2, total: 5, ocupadas: 2, precio: 500 },
      { id: "cumple_10", nombre: "Cumpleaños 10+", capacidad: 14, total: 3, ocupadas: 0, precio: 4200 },
    ],
    [],
  );

  const [mesaTipos, setMesaTipos] = useState<MesaTipo[]>(mesaDefault);

  const fallbackSlots: Slot[] = useMemo(
    () => [
      { hora_inicio: "13:00", hora_fin: "13:15" },
      { hora_inicio: "13:30", hora_fin: "13:45" },
      { hora_inicio: "14:00", hora_fin: "14:15" },
      { hora_inicio: "14:30", hora_fin: "14:45" },
      { hora_inicio: "15:00", hora_fin: "15:15" },
      { hora_inicio: "15:30", hora_fin: "15:45" },
      { hora_inicio: "16:00", hora_fin: "16:15" },
      { hora_inicio: "16:30", hora_fin: "16:45" },
      { hora_inicio: "17:00", hora_fin: "17:15" },
      { hora_inicio: "17:30", hora_fin: "17:45" },
      { hora_inicio: "18:00", hora_fin: "18:15" },
      { hora_inicio: "18:30", hora_fin: "18:45" },
      { hora_inicio: "19:00", hora_fin: "19:15" },
      { hora_inicio: "19:30", hora_fin: "19:45" },
      { hora_inicio: "20:00", hora_fin: "20:15" },
      { hora_inicio: "20:30", hora_fin: "20:45" },
      { hora_inicio: "21:00", hora_fin: "21:15" },
      { hora_inicio: "21:30", hora_fin: "21:45" },
      { hora_inicio: "22:00", hora_fin: "22:15" },
      { hora_inicio: "22:30", hora_fin: "22:45" },
    ],
    [],
  );

  useEffect(() => {
    setLang(normalizeLang(searchParams.get("lang")));
  }, [searchParams]);

  // Cargar negocios/servicios
  useEffect(() => {
    (async () => {
      try {
        const [nRes, sRes] = await Promise.all([
          fetch(apiUrl("/api/negocios/"), { cache: "no-store" }),
          fetch(apiUrl("/api/servicios/"), { cache: "no-store" }),
        ]);
        const [nJson, sJson] = await Promise.all([nRes.json(), sRes.json()]);
        const negociosData = nJson?.length ? nJson : fallbackNegocios;
        const serviciosData = sJson?.length ? sJson : fallbackServicios;

        setNegocios(negociosData);
        setServicios(serviciosData);

        setSelectedNegocio(String(negociosData[0]?.id || ""));
        setSelectedServicio(String(serviciosData[0]?.id || ""));
      } catch {
        setNegocios(fallbackNegocios);
        setServicios(fallbackServicios);
        setSelectedNegocio(String(fallbackNegocios[0].id));
        setSelectedServicio(String(fallbackServicios[0].id));
      }
    })();
  }, []);

  // Cargar slots (disponibilidad)
  useEffect(() => {
    (async () => {
      if (!selectedServicio || !selectedDate) {
        setSlots([]);
        return;
      }

      try {
        const res = await fetch(
          apiUrl(`/api/agenda/disponibilidad/?servicio=${selectedServicio}&fecha=${selectedDate}`),
          { cache: "no-store" },
        );

        let data: Slot[] | null = null;
        if (res.ok) data = await res.json();

        const rawSlots = (data?.length ? data : fallbackSlots).map((s) => ({
          hora_inicio: normalizeHHMM(s.hora_inicio),
          hora_fin: normalizeHHMM(s.hora_fin),
        }));

        const filtered = rawSlots.filter((s) => !isSlotPast(selectedDate, s.hora_inicio, 15));
        const finalSlots = filtered.length ? filtered : [];

        setSlots(finalSlots);

        const first = finalSlots[0]?.hora_inicio || "";
        setSelectedSlot(first);

        if (finalSlots.length) {
          setSugerencia({
            fecha: selectedDate,
            hora_inicio: finalSlots[0].hora_inicio,
            hora_fin: finalSlots[0].hora_fin,
            razon: lang === "es" ? "Primer horario disponible del día" : "First available slot of the day",
          });
        } else {
          const nextDate = parseLocalDate(selectedDate);
          nextDate.setDate(nextDate.getDate() + 1);
          const nextISO = toISODateLocal(nextDate);
          setSugerencia({
            fecha: nextISO,
            hora_inicio: "13:00",
            hora_fin: "14:30",
            razon: lang === "es" ? "Ya pasó el horario de hoy. Sugerimos el siguiente día." : "Today is past. Suggesting next day.",
          });
        }
      } catch {
        const rawSlots = fallbackSlots.map((s) => ({
          hora_inicio: normalizeHHMM(s.hora_inicio),
          hora_fin: normalizeHHMM(s.hora_fin),
        }));
        const filtered = rawSlots.filter((s) => !isSlotPast(selectedDate, s.hora_inicio, 15));
        setSlots(filtered);
        setSelectedSlot(filtered[0]?.hora_inicio || "");

        const nextDate = parseLocalDate(selectedDate);
        setSugerencia({
          fecha: toISODateLocal(nextDate),
          hora_inicio: filtered[0]?.hora_inicio || "13:00",
          hora_fin: filtered[0]?.hora_fin || "14:00",
          razon: lang === "es" ? "Mostrando horarios estándar por falta de conexión." : "Showing standard slots due to connection issues.",
        });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedServicio, selectedDate]);

  // Cargar mesas por disponibilidad
  useEffect(() => {
    (async () => {
      if (!selectedServicio || !selectedSlot) {
        setMesaTipos(mesaDefault);
        return;
      }
      const slotEnd = getSlotEnd(selectedSlot, slots, fallbackSlots);
      if (!slotEnd) {
        setMesaTipos(mesaDefault);
        return;
      }

      try {
        const res = await fetch(
          apiUrl(`/api/mesas/disponibilidad/?servicio=all&fecha=${selectedDate}&hora_inicio=${selectedSlot}&hora_fin=${slotEnd}`),
          { cache: "no-store" },
        );
        const data = await res.json().catch(() => []);
        const mesasData: MesaTipo[] = Array.isArray(data) ? data : [];
        const nextMesas = mesasData.length ? mesasData : mesaDefault;
        setMesaTipos(nextMesas);
      } catch {
        setMesaTipos(mesaDefault);
      }
    })();
  }, [selectedServicio, selectedDate, selectedSlot, slots, fallbackSlots, mesaDefault]);

  const copy = useMemo(
    () => ({
      es: {
        heroBadge: "IA activa para sugerir horarios",
        brand: "Restaurante El Mirador",
        heroTitle: "Reserva sin fricción",
        heroDescription:
          "Horario 13:00 - 23:00 · Abierto Lunes a Domingo · Selecciona fecha y hora disponible; aplicamos tolerancia de 15 minutos.",
        featurePills: ["Confirmación por correo", "Sin filas · disponibilidad real", "Se agrega a Calendar"],
        backLink: "← Panel interno",
        step1Label: "Paso 1",
        step1Title: "Datos de la reservación",
        step1Subtitle: "Todos los campos son obligatorios",
        dateTimeLabel: "Fecha y horario",
        dateTimeTitle: "Selecciona tu fecha",
        dateTimeNote: "Abierto Lunes a Domingo · Horario 13:00 - 23:00 · máximo 30 días adelante.",
        negocioLabel: "Negocio",
        negocioPlaceholder: "Selecciona negocio",
        servicioLabel: "Servicio",
        servicioPlaceholder: "Selecciona servicio",
        servicioNote: "Solo servicios activos.",
        nameLabel: "Tu nombre",
        emailLabel: "Correo",
        emailHelp: "Confirmaciones y recordatorios.",
        phoneLabel: "Teléfono",
        notesLabel: "Notas",
        notesPlaceholder: "Ej: cumpleaños, silla bebé, alergias.",
        holdNotice:
          "Guardamos la mesa a la hora seleccionada con 15 minutos de tolerancia. La duración se calcula según el servicio.",
        selectionPrefix: "Fecha seleccionada",
        timePrefix: "Hora",
        timeFallback: "Selecciona un horario",
        submit: "Reservar mesa",
        success: "Reserva creada. Te enviamos confirmación por correo.",
        errors: { generic: "No pudimos crear la reserva. Intenta con otro horario." },
        step2Label: "Paso 2",
        step2Title: "Mesas y resumen",
        step2Note: "Elige el tipo de mesa, revisa el precio y confirma tu reservación.",
        weekDays: ["D", "L", "M", "M", "J", "V", "S"],
        availabilityTitle: "Horarios disponibles",
        availabilityNote: "Se actualiza al elegir fecha",
        closedMessage: "Selecciona otro día u horario.",
        emptySlots: "Sin horarios. Cambia fecha.",
        mesaTitle: "Mesas disponibles",
        mesaNote: "Capacidad y mesas libres por tipo",
        iaTitle: "IA activa",
        iaTag: "Sugerencias",
        iaFallback: "Cuando detectemos conflicto, propondremos horarios alternos aquí.",
        iaUseSuggested: "Usar horario sugerido",
        summaryTitle: "Resumen",
        summaryFields: {
          negocio: "Negocio",
          servicio: "Servicio",
          fecha: "Fecha",
          hora: "Hora",
          mesa: "Mesa",
          precio: "Precio",
        },
        monthLocale: "es-MX",
        overlay: {
          bookingTitle: "Reserva enviada",
          bookingBody: "Se mandó el correo con la confirmación y tu mesa quedó apartada.",
          payTitle: "Redirigiendo a pago",
          payBody: "Te llevamos a la pasarela segura para completar el pago.",
          payError: "No pudimos iniciar el pago. Intenta de nuevo.",
          close: "Cerrar",
        },
      },
      en: {
        heroBadge: "AI on to suggest times",
        brand: "El Mirador Restaurant",
        heroTitle: "Frictionless booking",
        heroDescription:
          "Hours 1:00 pm - 11:00 pm · Open Monday to Sunday · Pick a date and available time; we hold tables with 15 minutes grace.",
        featurePills: ["Email confirmation", "No lines · real availability", "Added to Calendar"],
        backLink: "← Internal panel",
        step1Label: "Step 1",
        step1Title: "Booking details",
        step1Subtitle: "All fields are required",
        dateTimeLabel: "Date and time",
        dateTimeTitle: "Pick your date",
        dateTimeNote: "Open Monday to Sunday · Hours 1:00 pm - 11:00 pm · up to 30 days ahead.",
        negocioLabel: "Business",
        negocioPlaceholder: "Select business",
        servicioLabel: "Service",
        servicioPlaceholder: "Select service",
        servicioNote: "Only active services.",
        nameLabel: "Your name",
        emailLabel: "Email",
        emailHelp: "Confirmations and reminders.",
        phoneLabel: "Phone",
        notesLabel: "Notes",
        notesPlaceholder: "E.g. birthday, baby seat, allergies.",
        holdNotice:
          "We hold your table at the selected time with 15 minutes grace. Duration depends on the service.",
        selectionPrefix: "Selected date",
        timePrefix: "Time",
        timeFallback: "Pick a time slot",
        submit: "Book table",
        success: "Booking created. We sent a confirmation email.",
        errors: { generic: "We couldn't create the booking. Try another time slot." },
        step2Label: "Step 2",
        step2Title: "Tables & summary",
        step2Note: "Choose your table type, review pricing, and confirm your booking.",
        weekDays: ["S", "M", "T", "W", "T", "F", "S"],
        availabilityTitle: "Available times",
        availabilityNote: "Refreshes after picking a date",
        closedMessage: "Choose another date or time.",
        emptySlots: "No times available. Try another date.",
        mesaTitle: "Table availability",
        mesaNote: "Capacity and free tables per type",
        iaTitle: "AI on",
        iaTag: "Suggestions",
        iaFallback: "If we find conflicts, we'll propose alternative times here.",
        iaUseSuggested: "Use suggested time",
        summaryTitle: "Summary",
        summaryFields: {
          negocio: "Business",
          servicio: "Service",
          fecha: "Date",
          hora: "Time",
          mesa: "Table",
          precio: "Price",
        },
        monthLocale: "en-US",
        overlay: {
          bookingTitle: "Booking sent",
          bookingBody: "We emailed the confirmation and held your table.",
          payTitle: "Redirecting to payment",
          payBody: "Taking you to the secure payment page.",
          payError: "We couldn’t start the payment. Try again.",
          close: "Close",
        },
      },
    }),
    [],
  );

  const t = copy[lang];

  const servicioLabelMap = useMemo<Record<string, { es: string; en: string }>>(
    () => ({
      "1": { es: "Mesa para 2", en: "Table for 2" },
      "2": { es: "Mesa para 4", en: "Table for 4" },
      "3": { es: "Mesa VIP", en: "VIP table" },
      "4": { es: "Mesa cumpleaños 10+", en: "Birthday table 10+" },
    }),
    [],
  );

  const mesaLabelMap = useMemo(
    () => ({
      normal_2: lang === "es" ? "Mesa 2 personas" : "Table for 2",
      normal_4: lang === "es" ? "Mesa 4 personas" : "Table for 4",
      vip_2: lang === "es" ? "Mesa VIP 2" : "VIP table for 2",
      vip_grande: lang === "es" ? "Mesa VIP 5-12" : "VIP table 5-12",
      cumple_10: lang === "es" ? "Cumpleaños 10+" : "Birthday 10+",
    }),
    [lang],
  );

  const formatServicioNombre = (servicio?: Servicio) => {
    if (!servicio) return "";
    const key = String(servicio.id);
    const label = servicioLabelMap[key];
    if (!label) return servicio.nombre;
    return lang === "es" ? label.es : label.en;
  };

  const formatMesaNombre = (mesa: MesaTipo) => (mesaLabelMap as any)[mesa.id] ?? mesa.nombre;

  const handleLangChange = (value: Lang) => {
    setLang(value);
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set("lang", value);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const selectedNegocioName =
    negocios.find((n) => String(n.id) === selectedNegocio)?.nombre ||
    (lang === "es" ? t.brand : "El Mirador Restaurant");

  const selectedServicioObj = servicios.find((s) => String(s.id) === selectedServicio);
  const selectedServicioName = formatServicioNombre(selectedServicioObj) || t.servicioPlaceholder;
  const selectedServicioPrecio = Number(selectedServicioObj?.precio ?? 0);

  const mesaTiposParaMostrar = useMemo(() => {
    const keys = inferMesaKeysFromServicio(selectedServicioObj);
    if (!keys.length) return mesaTipos;

    const byId = mesaTipos.filter((m) => keys.includes(m.id));
    if (byId.length) return byId;

    const byName = mesaTipos.filter((m) => matchMesaByName(m.nombre, keys));
    return byName.length ? byName : mesaTipos;
  }, [mesaTipos, selectedServicioObj]);

  // ✅ Asegurar que si la mesa seleccionada ya no existe (cambiaste servicio), se limpie
  useEffect(() => {
    if (selectedMesaId && !mesaTiposParaMostrar.some((m) => m.id === selectedMesaId)) {
      setSelectedMesaId("");
    }
  }, [mesaTiposParaMostrar, selectedMesaId]);

  const selectedMesaObj = useMemo(
    () => mesaTiposParaMostrar.find((m) => m.id === selectedMesaId) || null,
    [mesaTiposParaMostrar, selectedMesaId],
  );

  const mesasResumen = mesaTiposParaMostrar
    .map((m) => `${formatMesaNombre(m)}: ${Math.max(m.total - m.ocupadas, 0)}/${m.total}`)
    .join(" · ");

  const calendarDays = useMemo(() => daysInMonth(monthView), [monthView]);

  const isClosedDay = (iso: string) => {
    if (CLOSED_WEEKDAY < 0) return false;
    const d = parseLocalDate(iso);
    return d.getDay() === CLOSED_WEEKDAY;
  };

  const isDisabledDay = (d: Date) => {
    const iso = toISODateLocal(d);
    const outsideMonth = d.getMonth() !== monthView.getMonth();
    const isPast = iso < todayISO;
    const isFuture = iso > maxISO;
    return outsideMonth || isPast || isFuture;
  };

  const monthLabel = useMemo(
    () => monthView.toLocaleString(t.monthLocale, { month: "long", year: "numeric" }),
    [monthView, t.monthLocale],
  );

  const canPrevMonth = useMemo(() => monthKey(monthView) > monthKey(parseLocalDate(todayISO)), [monthView, todayISO]);
  const canNextMonth = useMemo(() => monthKey(monthView) < monthKey(parseLocalDate(maxISO)), [monthView, maxISO]);

  const nextAvailable = useMemo(() => {
    if (slots.length) return { fecha: selectedDate, hora_inicio: slots[0].hora_inicio };
    const filteredFallback = fallbackSlots
      .map((s) => ({ hora_inicio: normalizeHHMM(s.hora_inicio), hora_fin: normalizeHHMM(s.hora_fin) }))
      .filter((s) => !isSlotPast(selectedDate, s.hora_inicio, 15));
    if (filteredFallback.length) return { fecha: selectedDate, hora_inicio: filteredFallback[0].hora_inicio };
    return null;
  }, [slots, fallbackSlots, selectedDate]);

  const prettyDate = useMemo(
    () => (selectedDate ? formatDatePretty(selectedDate, t.monthLocale) : "—"),
    [selectedDate, t.monthLocale],
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    setSuccess(false);
    setErrorMsg(null);
    setSugerencia(null);
    setOverlay(null);

    const formData = new FormData(form);
    const payload = {
      negocio: selectedNegocio,
      servicio: selectedServicio,
      nombre: formData.get("nombre"),
      email: formData.get("email"),
      telefono: formData.get("telefono"),
      fecha: selectedDate,
      hora_inicio: selectedSlot,
      notas: formData.get("notas"),
      mesa_tipo: selectedMesaId, // ✅ mesa elegida
    };

    const res = await fetch("/api/sir/public/crear-cita", {
      method: "POST",
      body: new URLSearchParams(payload as any),
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok) {
      setSuccess(true);
      setOverlay({
        title: t.overlay.bookingTitle,
        description: t.overlay.bookingBody,
        tone: "success",
      });
      form?.reset();
      setSelectedSlot("");
      setSelectedMesaId("");
      return;
    }

    setErrorMsg(data?.msg || t.errors.generic);
    if (data?.sugerencia) setSugerencia(data.sugerencia);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="relative overflow-hidden border-b border-slate-900/40 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/30">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-5 py-8 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold text-emerald-100">
                <span className="h-2 w-2 rounded-full bg-emerald-300" />
                {t.heroBadge}
              </span>
              <span className="rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold text-emerald-100">
                {selectedNegocioName}
              </span>
              <span className="rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold text-emerald-100">
                {lang === "es" ? "Horarios 13:00 - 23:00 · L-D" : "Hours 1 pm - 11 pm · Mon-Sun"}
              </span>
            </div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-emerald-300/90">{t.brand}</p>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold leading-tight">{t.heroTitle}</h1>
              <div className="flex gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => handleLangChange("es")}
                  className={`rounded-full border px-3 py-1 font-semibold transition ${
                    lang === "es" ? "border-emerald-200 text-emerald-100" : "border-slate-700 text-slate-300"
                  }`}
                >
                  ES
                </button>
                <button
                  type="button"
                  onClick={() => handleLangChange("en")}
                  className={`rounded-full border px-3 py-1 font-semibold transition ${
                    lang === "en" ? "border-emerald-200 text-emerald-100" : "border-slate-700 text-slate-300"
                  }`}
                >
                  EN
                </button>
              </div>
            </div>
            <p className="max-w-3xl text-sm text-slate-300">{t.heroDescription}</p>
            <div className="flex flex-wrap gap-2 text-[11px] text-emerald-100">
              {t.featurePills.map((pill) => (
                <span key={pill} className="rounded-full border border-emerald-300/30 px-3 py-1">
                  {pill}
                </span>
              ))}
            </div>
          </div>
          <Link
            href={withLangParam("/citas", lang)}
            className="inline-flex items-center gap-2 self-start rounded-full border border-emerald-300/50 bg-slate-900/60 px-4 py-2 text-xs font-semibold text-emerald-100 shadow-inner shadow-emerald-500/10 transition hover:border-emerald-200"
          >
            {t.backLink}
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-5 py-8">
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-emerald-900/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-amber-200">{t.step1Label}</p>
                <h2 className="text-xl font-semibold">{t.step1Title}</h2>
              </div>
              <div className="text-xs text-slate-400">{t.step1Subtitle}</div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium">{t.negocioLabel}</label>
                <select
                  name="negocio"
                  value={selectedNegocio}
                  onChange={(e) => setSelectedNegocio(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
                  required
                >
                  <option value="">{t.negocioPlaceholder}</option>
                  {negocios.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">{t.servicioLabel}</label>
                <select
                  name="servicio"
                  value={selectedServicio}
                  onChange={(e) => {
                    setSelectedServicio(e.target.value);
                    setSelectedMesaId(""); // ✅ reset mesa al cambiar servicio
                  }}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
                  required
                >
                  <option value="">{t.servicioPlaceholder}</option>
                  {servicios.map((s) => (
                    <option key={s.id} value={s.id}>
                      {formatServicioNombre(s)}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-400">{t.servicioNote}</p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium">{t.nameLabel}</label>
                <input
                  name="nombre"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">{t.emailLabel}</label>
                <input
                  type="email"
                  name="email"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
                  required
                />
                <p className="text-xs text-slate-500">{t.emailHelp}</p>
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium">{t.phoneLabel}</label>
                <input
                  name="telefono"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">{t.notesLabel}</label>
              <textarea
                name="notas"
                rows={3}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
                placeholder={t.notesPlaceholder}
              />
            </div>

            <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-emerald-200">{t.dateTimeLabel}</p>
                  <h3 className="text-lg font-semibold">{t.dateTimeTitle}</h3>
                  <p className="text-[11px] text-slate-400">{t.dateTimeNote}</p>
                </div>
                <div className="flex gap-2 text-xs">
                  <button
                    type="button"
                    className="rounded-full border border-slate-700 px-2.5 py-1.5 text-slate-300 hover:border-emerald-400 disabled:border-slate-800 disabled:text-slate-600"
                    onClick={() => {
                      const prev = new Date(monthView);
                      prev.setMonth(prev.getMonth() - 1);
                      setMonthView(prev);
                    }}
                    disabled={!canPrevMonth}
                  >
                    ←
                  </button>
                  <span className="rounded-full border border-slate-700 px-3 py-1 text-[11px] text-amber-100">{monthLabel}</span>
                  <button
                    type="button"
                    className="rounded-full border border-slate-700 px-2.5 py-1.5 text-slate-300 hover:border-emerald-400 disabled:border-slate-800 disabled:text-slate-600"
                    onClick={() => {
                      const next = new Date(monthView);
                      next.setMonth(next.getMonth() + 1);
                      setMonthView(next);
                    }}
                    disabled={!canNextMonth}
                  >
                    →
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3">
                <div className="grid grid-cols-7 gap-1 text-center text-[10px] uppercase tracking-wide text-slate-400">
                  {t.weekDays.map((d, idx) => (
                    <span key={`${d}-${idx}`} className="py-1">
                      {d}
                    </span>
                  ))}

                  {calendarDays.map((d, idx) => {
                    const disabled = isDisabledDay(d);
                    const iso = toISODateLocal(d);
                    const isSelected = iso === selectedDate;

                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={disabled}
                        onClick={() => {
                          if (iso < todayISO || iso > maxISO) return;
                          setSelectedDate(iso);
                        }}
                        className={`relative rounded-lg py-1.5 text-xs transition ${
                          disabled
                            ? "cursor-not-allowed bg-slate-800/40 text-slate-600"
                            : isSelected
                              ? "bg-emerald-500 text-white shadow-lg shadow-emerald-400/30"
                              : "bg-slate-800 text-slate-100 hover:bg-emerald-500/10"
                        }`}
                      >
                        {d.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-xs uppercase tracking-wider opacity-70">
                  {lang === "es" ? "Selección actual" : "Current selection"}
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-sm">
                    📅 {selectedDate ? prettyDate : "—"}
                  </span>

                  <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-sm">
                    🕒 {selectedSlot ? selectedSlot : t.timeFallback}
                  </span>

                  {selectedDate && selectedSlot && (
                    <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-sm">
                      ✅ {lang === "es" ? "Listo para reservar" : "Ready to book"}
                    </span>
                  )}
                </div>

                <div className="mt-2 text-xs opacity-70">{t.holdNotice}</div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">{t.availabilityTitle}</p>
                  <div className="text-[11px] text-slate-400">
                    {nextAvailable
                      ? `${lang === "es" ? "Próximo" : "Next"}: ${nextAvailable.fecha} ${nextAvailable.hora_inicio}`
                      : t.availabilityNote}
                  </div>
                </div>

                <div className="max-h-56 space-y-2 overflow-auto pr-1">
                  {isClosedDay(selectedDate) && <p className="text-xs text-amber-400">{t.closedMessage}</p>}

                  {!isClosedDay(selectedDate) && slots.length === 0 && (
                    <div className="space-y-2 text-xs text-slate-300">
                      <p>
                        {lang === "es"
                          ? "Hoy ya pasó el horario o no hay disponibilidad. Cambia fecha."
                          : "Today is past or no availability. Pick another date."}
                      </p>
                      <div className="text-slate-400">{lang === "es" ? "Horarios estándar:" : "Standard hours:"}</div>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {fallbackSlots
                          .map((slot) => ({
                            hora_inicio: normalizeHHMM(slot.hora_inicio),
                            hora_fin: normalizeHHMM(slot.hora_fin),
                          }))
                          .filter((s) => !isSlotPast(selectedDate, s.hora_inicio, 15))
                          .map((slot, idx) => {
                            const isSelected = slot.hora_inicio === selectedSlot;
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setSelectedSlot(slot.hora_inicio)}
                                className={`rounded-lg border px-3 py-2 text-left transition ${
                                  isSelected
                                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-50 shadow-sm"
                                    : "border-slate-800 bg-slate-900/60 text-slate-100 hover:border-emerald-400"
                                }`}
                              >
                                {slot.hora_inicio} - {slot.hora_fin}
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  )}

                  {slots.map((slot, idx) => {
                    const isSelected = slot.hora_inicio === selectedSlot;
                    const disabled = isSlotPast(selectedDate, slot.hora_inicio, 15);

                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={disabled}
                        onClick={() => setSelectedSlot(slot.hora_inicio)}
                        className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                          disabled
                            ? "cursor-not-allowed border-slate-800 bg-slate-950/60 text-slate-600"
                            : isSelected
                              ? "border-emerald-500 bg-emerald-500/10 text-emerald-50 shadow-sm"
                              : "border-slate-800 bg-slate-900/60 text-slate-100 hover:border-emerald-400"
                        }`}
                      >
                        {slot.hora_inicio} - {slot.hora_fin}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-400">
              {t.selectionPrefix}: <span className="font-semibold text-amber-200">{selectedDate}</span> · {t.timePrefix}:{" "}
              <span className="font-semibold text-amber-200">{selectedSlot || t.timeFallback}</span>
            </div>

            <div className="grid gap-3 rounded-2xl border border-emerald-300/30 bg-emerald-400/5 p-4 text-xs text-emerald-50">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{t.iaTitle}</span>
                <span className="rounded-full border border-emerald-300/40 px-2 py-1 text-[11px]">{t.iaTag}</span>
              </div>
              {sugerencia ? (
                <>
                  <p>
                    {lang === "es"
                      ? `${sugerencia.fecha} de ${sugerencia.hora_inicio} a ${sugerencia.hora_fin}`
                      : `${sugerencia.fecha} from ${sugerencia.hora_inicio} to ${sugerencia.hora_fin}`}
                  </p>
                  <p className="text-emerald-100/80">{sugerencia.razon}</p>
                  <button
                    type="button"
                    onClick={() => {
                      if (sugerencia.fecha && sugerencia.fecha !== selectedDate) setSelectedDate(sugerencia.fecha);
                      setSelectedSlot(normalizeHHMM(sugerencia.hora_inicio));
                    }}
                    className="self-start rounded-lg border border-emerald-300/40 bg-emerald-300/10 px-3 py-2 text-xs font-semibold text-emerald-50 hover:border-emerald-200"
                  >
                    {t.iaUseSuggested}
                  </button>
                </>
              ) : (
                <p className="text-emerald-100/80">{t.iaFallback}</p>
              )}
            </div>
          </section>

          <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-slate-100 shadow-xl shadow-emerald-900/30 lg:sticky lg:top-6 max-w-md w-full ml-auto">
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-[0.25em] text-emerald-200">{t.step2Label}</p>
              <h2 className="text-lg font-semibold">{t.step2Title}</h2>
              <p className="text-[11px] text-slate-400">{t.step2Note}</p>
            </div>

            <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">{t.mesaTitle}</p>
                <div className="text-xs text-slate-400">{t.mesaNote}</div>
              </div>

              {/* ✅ AQUÍ ESTÁ EL CAMBIO: tarjetas clickeables + selección */}
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {mesaTiposParaMostrar.map((mesa) => {
                  const libres = Math.max(mesa.total - mesa.ocupadas, 0);
                  const isSelected = mesa.id === selectedMesaId;
                  const disabled = libres <= 0;

                  return (
                    <button
                      key={mesa.id}
                      type="button"
                      disabled={disabled}
                      onClick={() => setSelectedMesaId(mesa.id)}
                      className={`flex h-full min-h-[130px] flex-col justify-between gap-2 rounded-xl border px-3 py-3 text-left text-sm transition ${
                        disabled
                          ? "cursor-not-allowed border-slate-800 bg-slate-950/40 text-slate-600"
                          : isSelected
                            ? "border-emerald-400 bg-emerald-500/10 text-emerald-100 shadow shadow-emerald-500/30"
                            : "border-slate-800 bg-slate-900/70 text-slate-100 hover:border-emerald-300/60"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="font-semibold">{formatMesaNombre(mesa)}</span>
                        <span className={`text-xs font-semibold ${isSelected ? "text-amber-200" : "text-amber-300"}`}>
                          {libres} / {mesa.total}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs text-slate-400">
                          {lang === "es" ? `Capacidad ${mesa.capacidad} pax` : `Capacity ${mesa.capacidad} pax`}
                        </p>
                        <p className="text-xs text-emerald-100">
                          {lang === "es" ? `Precio: $${mesa.precio}` : `Price: $${mesa.precio}`}
                        </p>
                        {isSelected && (
                          <p className="text-[11px] text-emerald-200">{lang === "es" ? "Seleccionada" : "Selected"}</p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Hint pro */}
              {mesaTiposParaMostrar.length > 0 && (
                <p className="text-[11px] text-slate-400">
                  {lang === "es" ? "Tip: da click en una mesa para elegirla." : "Tip: click a table to select it."}
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-sm text-slate-200">
              <p className="font-semibold text-amber-200">{t.summaryTitle}</p>
              <div className="mt-2 space-y-1 text-xs text-slate-300">
                <p>
                  {t.summaryFields.negocio}: {selectedNegocioName}
                </p>
                <p>
                  {t.summaryFields.servicio}: {selectedServicioName}
                </p>
                <p>
                  {t.summaryFields.fecha}: {selectedDate}{" "}
                  <span className="text-slate-400">({selectedDate ? prettyDate : "—"})</span>
                </p>
                <p>
                  {t.summaryFields.hora}: {selectedSlot || t.timeFallback}
                </p>
                <p>
                  {t.summaryFields.mesa}:{" "}
                  {selectedMesaObj
                    ? formatMesaNombre(selectedMesaObj)
                    : lang === "es"
                      ? "Selecciona una mesa"
                      : "Pick a table"}
                </p>
              </div>
            </div>

            <input type="hidden" name="fecha" value={selectedDate} />
            <input type="hidden" name="hora_inicio" value={selectedSlot} />
            <input type="hidden" name="mesa_tipo" value={selectedMesaId} />

            <div className="grid gap-2">
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5 hover:shadow-emerald-500/40 disabled:from-slate-700 disabled:to-slate-700"
                disabled={!selectedSlot || !selectedMesaId}
              >
                {t.submit}
              </button>

              <button
                type="button"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-400/60 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-100 shadow-inner shadow-emerald-900/20 transition hover:-translate-y-0.5 hover:border-emerald-200"
                onClick={async () => {
                  setErrorMsg(null);
                  setOverlay(null);

                  if (!selectedServicio || !selectedSlot) {
                    setErrorMsg(lang === "es" ? "Selecciona servicio y horario." : "Select service and time.");
                    return;
                  }

                  const payload = {
                    servicio: selectedServicio,
                    precio: selectedServicioPrecio || 0,
                    titulo: `${formatServicioNombre(selectedServicioObj)} · ${selectedDate} ${selectedSlot}`,
                    success_url: window.location.origin + "/reservar?lang=" + lang + "&paid=1",
                    failure_url: window.location.origin + "/reservar?lang=" + lang + "&paid=0",
                  };

                  try {
                    const res = await fetch(apiUrl("/api/pagos/mercadopago/preferencia/"), {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(payload),
                    });

                    const data = await res.json().catch(() => ({}));
                    const redirect = data?.redirect || data?.sandbox_init_point || data?.init_point;

                    if (!res.ok || !redirect) throw new Error("mp failed");

                    setOverlay({ title: t.overlay.payTitle, description: t.overlay.payBody, tone: "info" });
                    window.location.href = redirect;
                  } catch {
                    setErrorMsg(lang === "es" ? "No pudimos iniciar el pago." : "Could not start payment.");
                    setOverlay({ title: t.overlay.payError, tone: "error" });
                  }
                }}
              >
                {lang === "es" ? "Pagar ahora" : "Pay now"}
              </button>
            </div>
          </section>
        </form>

        {overlay && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm">
            <div
              className={`w-full max-w-md rounded-2xl border px-6 py-6 shadow-2xl ${
                overlay.tone === "error"
                  ? "border-rose-400/70 bg-rose-500/10 text-rose-50 shadow-rose-500/30"
                  : overlay.tone === "success"
                    ? "border-emerald-300/70 bg-emerald-500/10 text-emerald-50 shadow-emerald-500/30"
                    : "border-sky-300/70 bg-sky-500/10 text-sky-50 shadow-sky-500/30"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-200/80">
                    {overlay.tone === "error"
                      ? lang === "es"
                        ? "Atención"
                        : "Heads up"
                      : overlay.tone === "success"
                        ? lang === "es"
                          ? "Listo"
                          : "Done"
                        : lang === "es"
                          ? "Continuamos"
                          : "Next"}
                  </p>
                  <h3 className="text-lg font-bold leading-tight">{overlay.title}</h3>
                  {overlay.description && <p className="mt-2 text-sm text-slate-200/90">{overlay.description}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => setOverlay(null)}
                  className="rounded-full border border-white/30 px-3 py-1 text-xs font-semibold text-white/90 transition hover:-translate-y-0.5 hover:border-white/70"
                >
                  {t.overlay.close}
                </button>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mt-4 rounded-lg border border-emerald-500/60 bg-emerald-500/10 p-4 text-sm text-emerald-100">
            {t.success}
          </div>
        )}
        {errorMsg && (
          <div className="mt-4 rounded-lg border border-rose-500/60 bg-rose-500/10 p-4 text-sm text-rose-100">
            {errorMsg}
          </div>
        )}
      </div>
    </main>
  );
}
