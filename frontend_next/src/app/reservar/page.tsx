/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiUrl } from "@/lib/api";

type Negocio = { id: number; nombre: string };
type Servicio = { id: number; nombre: string; negocio: number };
type Slot = { hora_inicio: string; hora_fin: string };
type Sugerencia = { fecha: string; hora_inicio: string; hora_fin: string; razon: string };

const today = new Date();
const maxDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
const CLOSED_WEEKDAY = 4; // 0=Dom ... 4=Jueves

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

export default function ReservarPage() {
  const [negocios, setNegocios] = useState<Negocio[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [selectedNegocio, setSelectedNegocio] = useState<string>("");
  const [selectedServicio, setSelectedServicio] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(formatISO(today));
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [sugerencia, setSugerencia] = useState<Sugerencia | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [monthView, setMonthView] = useState<Date>(today);

  useEffect(() => {
    (async () => {
      const [nRes, sRes] = await Promise.all([
        fetch(apiUrl("/api/negocios/"), { cache: "no-store" }),
        fetch(apiUrl("/api/servicios/"), { cache: "no-store" }),
      ]);
      const [nJson, sJson] = await Promise.all([nRes.json(), sRes.json()]);
      setNegocios(nJson || []);
      setServicios(sJson || []);
      if (nJson?.length) setSelectedNegocio(String(nJson[0].id));
      if (sJson?.length) setSelectedServicio(String(sJson[0].id));
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!selectedServicio || !selectedDate) {
        setSlots([]);
        return;
      }
      // Evita fetch en jueves cerrado
      const weekDay = new Date(selectedDate).getDay();
      if (weekDay === CLOSED_WEEKDAY) {
        setSlots([]);
        return;
      }
      const res = await fetch(
        apiUrl(`/api/agenda/disponibilidad/?servicio=${selectedServicio}&fecha=${selectedDate}`),
        { cache: "no-store" },
      );
      if (!res.ok) {
        setSlots([]);
        return;
      }
      const data = await res.json();
      setSlots(data || []);
      setSelectedSlot(data?.[0]?.hora_inicio || "");
    })();
  }, [selectedServicio, selectedDate]);

  const calendarDays = useMemo(() => daysInMonth(monthView), [monthView]);
  const isClosedDay = (d: Date) => d.getDay() === CLOSED_WEEKDAY;
  const isDisabledDay = (d: Date) => d < today || d > maxDate || d.getMonth() !== monthView.getMonth() || isClosedDay(d);

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
    setErrorMsg(data?.msg || "No pudimos crear la reserva. Intenta con otro horario.");
    if (data?.sugerencia) setSugerencia(data.sugerencia);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="flex items-center justify-between gap-4">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.25em] text-emerald-300/80">Restaurante El Mirador</p>
            <h1 className="text-4xl font-bold leading-tight">Reserva sin fricción</h1>
            <p className="text-slate-300 text-sm">
              Horario 13:00 - 23:00. Cerrado los jueves. Selecciona fecha y hora disponible; aplicamos tolerancia de
              15 minutos.
            </p>
          </div>
          <Link href="/citas" className="text-sm text-slate-400 hover:text-emerald-300">
            ← Panel interno
          </Link>
        </header>

        <div className="grid gap-6 md:grid-cols-[1.25fr,1fr]">
          <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium">Negocio</label>
                <select
                  name="negocio"
                  value={selectedNegocio}
                  onChange={(e) => setSelectedNegocio(e.target.value)}
                  className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                  required
                >
                  <option value="">Selecciona negocio</option>
                  {negocios.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Servicio</label>
                <select
                  name="servicio"
                  value={selectedServicio}
                  onChange={(e) => setSelectedServicio(e.target.value)}
                  className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                  required
                >
                  <option value="">Selecciona servicio</option>
                  {servicios.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-400">Solo servicios activos.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Tu nombre</label>
                  <input
                    name="nombre"
                    className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Correo</label>
                  <input
                    type="email"
                    name="email"
                    className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                    required
                  />
                  <p className="text-xs text-slate-500">Confirmaciones y recordatorios.</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Teléfono</label>
                  <input
                    name="telefono"
                    className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Notas</label>
                <textarea
                  name="notas"
                  rows={3}
                  className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                  placeholder="Ej: cumpleaños, silla bebé, alergias."
                />
              </div>

              <input type="hidden" name="fecha" value={selectedDate} />
              <input type="hidden" name="hora_inicio" value={selectedSlot} />

              <div className="text-xs text-slate-500">
                Te guardamos la mesa a la hora seleccionada con 15 minutos de tolerancia. La duración se calcula según
                el servicio.
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:bg-slate-700"
                disabled={!selectedSlot}
              >
                Reservar
              </button>
            </form>

            {success && (
              <div className="rounded-lg border border-emerald-500/60 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                Reserva creada. Te enviamos confirmación por correo.
              </div>
            )}
            {errorMsg && (
              <div className="rounded-lg border border-rose-500/60 bg-rose-500/10 p-4 text-sm text-rose-100">
                {errorMsg}
              </div>
            )}
            {sugerencia && (
              <div className="rounded-lg border border-emerald-500/50 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                <p className="font-semibold">Sugerencia de agenda</p>
                <p>
                  {sugerencia.fecha} de {sugerencia.hora_inicio} a {sugerencia.hora_fin}
                </p>
                <p className="text-emerald-200/80">{sugerencia.razon}</p>
              </div>
            )}
          </section>

          <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Selecciona la fecha</p>
                <p className="text-xs text-slate-500">Cerrado los jueves. Horario 13:00 - 23:00.</p>
              </div>
              <div className="flex gap-2 text-xs">
                <button
                  type="button"
                  className="rounded border border-slate-700 px-2 py-1 hover:border-emerald-400"
                  onClick={() => {
                    const prev = new Date(monthView);
                    prev.setMonth(prev.getMonth() - 1);
                    setMonthView(prev);
                  }}
                  disabled={monthView.getMonth() === today.getMonth()}
                >
                  ←
                </button>
                <button
                  type="button"
                  className="rounded border border-slate-700 px-2 py-1 hover:border-emerald-400"
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

            <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-400">
              {["D", "L", "M", "M", "J", "V", "S"].map((d) => (
                <span key={d} className="py-1">
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
                    className={`rounded-md py-2 text-sm transition ${
                      disabled
                        ? "cursor-not-allowed bg-slate-800/40 text-slate-700"
                        : isSelected
                          ? "bg-emerald-500 text-slate-950"
                          : "bg-slate-800 text-slate-100 hover:bg-slate-700"
                    }`}
                    title={isClosedDay(d) ? "Cerrado" : ""}
                  >
                    {d.getDate()}
                  </button>
                );
              })}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold">Horarios disponibles</p>
              <div className="space-y-2 max-h-60 overflow-auto pr-1">
                {isClosedDay(new Date(selectedDate)) && (
                  <p className="text-xs text-amber-400">Jueves cerrado. Selecciona otro día.</p>
                )}
                {!isClosedDay(new Date(selectedDate)) && slots.length === 0 && (
                  <p className="text-xs text-slate-500">Sin horarios. Cambia fecha.</p>
                )}
                {slots.map((slot, idx) => {
                  const isSelected = slot.hora_inicio === selectedSlot;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedSlot(slot.hora_inicio)}
                      className={`w-full rounded-md border px-3 py-2 text-left text-sm ${
                        isSelected
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-100"
                          : "border-slate-700 bg-slate-900/60 text-slate-100 hover:border-emerald-400"
                      }`}
                    >
                      {slot.hora_inicio} - {slot.hora_fin}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
