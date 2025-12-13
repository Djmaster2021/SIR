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

const today = new Date();
const maxDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
const CLOSED_WEEKDAY = -1; // -1 => sin cierre fijo
const fallbackNegocios: Negocio[] = [{ id: 1, nombre: "Restaurante El Mirador" }];
const fallbackServicios: Servicio[] = [
  { id: 1, nombre: "Mesa para 2", negocio: 1 },
  { id: 2, nombre: "Mesa para 4", negocio: 1 },
  { id: 3, nombre: "Mesa VIP", negocio: 1 },
  { id: 4, nombre: "Mesa cumpleaños 10+", negocio: 1 },
];

function formatISO(date: Date) {
  return date.toISOString().slice(0, 10);
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
  const slot = slots.find((s) => s.hora_inicio === selectedSlot) || fallbackSlots.find((s) => s.hora_inicio === selectedSlot);
  return slot?.hora_fin || null;
}

export default function ReservarPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [lang, setLang] = useState<Lang>(() => normalizeLang(searchParams.get("lang")));
  const [negocios, setNegocios] = useState<Negocio[]>(fallbackNegocios);
  const [servicios, setServicios] = useState<Servicio[]>(fallbackServicios);
  const [selectedNegocio, setSelectedNegocio] = useState<string>(String(fallbackNegocios[0].id));
  const [selectedServicio, setSelectedServicio] = useState<string>(String(fallbackServicios[0].id));
  const [selectedDate, setSelectedDate] = useState<string>(formatISO(today));
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [sugerencia, setSugerencia] = useState<Sugerencia | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [monthView, setMonthView] = useState<Date>(today);
  const mesaDefault: MesaTipo[] = useMemo(
    () => [
      { id: "mesa-2", nombre: "Mesa 2 personas", capacidad: 2, total: 10, ocupadas: 5, precio: 0 },
      { id: "mesa-4", nombre: "Mesa 4 personas", capacidad: 4, total: 8, ocupadas: 3, precio: 0 },
      { id: "vip", nombre: "VIP / Terraza", capacidad: 6, total: 4, ocupadas: 1, precio: 300 },
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
      } catch (err) {
        setNegocios(fallbackNegocios);
        setServicios(fallbackServicios);
        setSelectedNegocio(String(fallbackNegocios[0].id));
        setSelectedServicio(String(fallbackServicios[0].id));
      }
    })();
  }, []);

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
        if (res.ok) {
          data = await res.json();
        }
        const slotSource = data?.length ? data : fallbackSlots;
        setSlots(slotSource);
        setSelectedSlot(slotSource?.[0]?.hora_inicio || "");
        if (!data?.length) {
          const nextDate = new Date(selectedDate);
          nextDate.setDate(nextDate.getDate() + 1);
          setSugerencia({
            fecha: formatISO(nextDate),
            hora_inicio: "13:00",
            hora_fin: "14:30",
            razon: "Primera hora disponible al día siguiente",
          });
        } else {
          setSugerencia({
            fecha: selectedDate,
            hora_inicio: data[0].hora_inicio,
            hora_fin: data[0].hora_fin,
            razon: "Primer horario disponible del día",
          });
        }
      } catch (err) {
        setSlots(fallbackSlots);
        setSelectedSlot(fallbackSlots[0]?.hora_inicio || "");
        const nextDate = new Date(selectedDate);
        setSugerencia({
          fecha: formatISO(nextDate),
          hora_inicio: fallbackSlots[0]?.hora_inicio || "13:00",
          hora_fin: fallbackSlots[0]?.hora_fin || "14:00",
          razon: "Mostrando horarios estándar por falta de conexión.",
        });
      }
    })();
  }, [selectedServicio, selectedDate]);

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
          apiUrl(
            `/api/mesas/disponibilidad/?servicio=all&fecha=${selectedDate}&hora_inicio=${selectedSlot}&hora_fin=${slotEnd}`,
          ),
          { cache: "no-store" },
        );
        const data = await res.json().catch(() => []);
        const mesasData: MesaTipo[] = Array.isArray(data) ? data : [];
        const nextMesas = mesasData.length ? mesasData : mesaDefault;
        setMesaTipos(nextMesas);
      } catch (err) {
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
        errors: {
          generic: "No pudimos crear la reserva. Intenta con otro horario.",
        },
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
        errors: {
          generic: "We couldn't create the booking. Try another time slot.",
        },
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
  const formatMesaNombre = (mesa: MesaTipo) => mesaLabelMap[mesa.id] ?? mesa.nombre;
  const handleLangChange = (value: Lang) => {
    setLang(value);
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set("lang", value);
    router.replace(`?${params.toString()}`, { scroll: false });
  };
  const selectedNegocioName =
    negocios.find((n) => String(n.id) === selectedNegocio)?.nombre || (lang === "es" ? t.brand : "El Mirador Restaurant");
  const selectedServicioObj = servicios.find((s) => String(s.id) === selectedServicio);
  const selectedServicioName = formatServicioNombre(selectedServicioObj) || t.servicioPlaceholder;
  const selectedServicioPrecio = Number(selectedServicioObj?.precio ?? 0);
  const mesasResumen = mesaTipos
    .map((m) => `${formatMesaNombre(m)}: ${Math.max(m.total - m.ocupadas, 0)}/${m.total}`)
    .join(" · ");

  const calendarDays = useMemo(() => daysInMonth(monthView), [monthView]);
  const isClosedDay = (d: Date) => CLOSED_WEEKDAY >= 0 && d.getDay() === CLOSED_WEEKDAY;
  const isDisabledDay = (d: Date) => d < today || d > maxDate || d.getMonth() !== monthView.getMonth();
  const nextAvailable = useMemo(() => {
    if (slots.length) return { fecha: selectedDate, hora_inicio: slots[0].hora_inicio };
    if (fallbackSlots.length) return { fecha: selectedDate, hora_inicio: fallbackSlots[0].hora_inicio };
    return null;
  }, [slots, fallbackSlots, selectedDate]);
  const monthLabel = useMemo(
    () => monthView.toLocaleString(t.monthLocale, { month: "long", year: "numeric" }),
    [monthView, t.monthLocale],
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccess(false);
    setErrorMsg(null);
    setSugerencia(null);
    const formData = new FormData(e.currentTarget);
    const payload = {
      negocio: selectedNegocio,
      servicio: selectedServicio,
      nombre: formData.get("nombre"),
      email: formData.get("email"),
      telefono: formData.get("telefono"),
      fecha: selectedDate,
      hora_inicio: selectedSlot,
      notas: formData.get("notas"),
    };
    const res = await fetch("/api/sir/public/crear-cita", {
      method: "POST",
      body: new URLSearchParams(payload as any),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setSuccess(true);
      e.currentTarget.reset();
      setSelectedSlot("");
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
                  onChange={(e) => setSelectedServicio(e.target.value)}
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
                    disabled={monthView.getMonth() === today.getMonth()}
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
                    disabled={monthView > maxDate}
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
                    const iso = formatISO(d);
                    const isSelected = iso === selectedDate;
                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={disabled}
                        onClick={() => setSelectedDate(iso)}
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
                  {isClosedDay(new Date(selectedDate)) && (
                    <p className="text-xs text-amber-400">{t.closedMessage}</p>
                  )}
                  {!isClosedDay(new Date(selectedDate)) && slots.length === 0 && (
                    <div className="space-y-2 text-xs text-slate-300">
                      <p>{t.emptySlots}</p>
                      <div className="text-slate-400">{lang === "es" ? "Horarios estándar:" : "Standard hours:"}</div>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {fallbackSlots.map((slot, idx) => {
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
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedSlot(slot.hora_inicio)}
                        className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
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
            </div>

            <div className="text-xs text-slate-400">
              {t.selectionPrefix}: <span className="font-semibold text-amber-200">{selectedDate}</span> · {t.timePrefix}:{" "}
              <span className="font-semibold text-amber-200">{selectedSlot || t.timeFallback}</span>
            </div>

            <div className="rounded-2xl border border-amber-300/20 bg-amber-400/5 px-4 py-3 text-xs text-amber-100">
              {t.holdNotice}
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
                    onClick={() => setSelectedSlot(sugerencia.hora_inicio)}
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
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {mesaTipos.map((mesa, idx) => {
                  const libres = Math.max(mesa.total - mesa.ocupadas, 0);
                  const highlighted = idx === 0;
                  return (
                    <div
                      key={mesa.id}
                      className={`flex h-full min-h-[130px] flex-col justify-between gap-2 rounded-xl border px-3 py-3 text-left text-sm ${
                        highlighted
                          ? "border-emerald-400 bg-emerald-500/10 text-emerald-100 shadow shadow-emerald-500/30"
                          : "border-slate-800 bg-slate-900/70 text-slate-100"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="font-semibold">{formatMesaNombre(mesa)}</span>
                        <span className={`text-xs font-semibold ${highlighted ? "text-amber-200" : "text-amber-300"}`}>
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
                      </div>
                    </div>
                  );
                })}
              </div>
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
                  {t.summaryFields.fecha}: {selectedDate}
                </p>
                <p>
                  {t.summaryFields.hora}: {selectedSlot || t.timeFallback}
                </p>
                <p>
                  {t.summaryFields.mesa}: {mesasResumen || "-"}
                </p>
              </div>
            </div>

            <input type="hidden" name="fecha" value={selectedDate} />
            <input type="hidden" name="hora_inicio" value={selectedSlot} />
            <div className="grid gap-2">
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5 hover:shadow-emerald-500/40 disabled:from-slate-700 disabled:to-slate-700"
                disabled={!selectedSlot}
              >
                {t.submit}
              </button>
              <button
                type="button"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-400/60 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-100 shadow-inner shadow-emerald-900/20 transition hover:-translate-y-0.5 hover:border-emerald-200"
                onClick={async () => {
                  setErrorMsg(null);
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
                    if (!res.ok || !redirect) {
                      throw new Error("mp failed");
                    }
                    window.location.href = redirect;
                  } catch (err) {
                    setErrorMsg(lang === "es" ? "No pudimos iniciar el pago." : "Could not start payment.");
                  }
                }}
              >
                {lang === "es" ? "Pagar ahora" : "Pay now"}
              </button>
            </div>
          </section>
        </form>

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
