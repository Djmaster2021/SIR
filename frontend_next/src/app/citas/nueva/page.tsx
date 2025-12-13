"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiUrl } from "@/lib/api";
import { normalizeLang } from "@/lib/lang";

type Negocio = { id: number; nombre: string };
type Servicio = { id: number; nombre: string; negocio: number };
type Cliente = { id: number; nombre: string; negocio: number; email?: string };
type Slot = { hora_inicio: string; hora_fin: string };
type MesaTipo = { id: string; nombre: string; capacidad: number; total: number; ocupadas: number; precio: number };

const hoy = new Date();
const todayISO = hoy.toISOString().slice(0, 10);
const maxDateISO = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
const weekDays = ["D", "L", "M", "M", "J", "V", "S"];

const hours = Array.from({ length: 10 }, (_, i) => 13 + i); // 13 a 22
const minutes = ["00", "15", "30", "45"];

function addMinutes(time: string, mins: number) {
  const [h, m] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(h, m + mins, 0, 0);
  return date.toTimeString().slice(0, 5);
}

function daysInMonth(view: Date) {
  const year = view.getFullYear();
  const month = view.getMonth();
  const first = new Date(year, month, 1);
  const pad = first.getDay();
  const days: (Date | null)[] = [];
  for (let i = 0; i < pad; i++) days.push(null);
  const lastDay = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= lastDay; d++) days.push(new Date(year, month, d));
  return days;
}

function formatISO(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default function NuevaCitaPage() {
  const searchParams = useSearchParams();
  const lang = normalizeLang(searchParams.get("lang"));
  const router = useRouter();
  const [negocios, setNegocios] = useState<Negocio[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [selectedNegocio, setSelectedNegocio] = useState("");
  const [selectedServicio, setSelectedServicio] = useState("");
  const [selectedCliente, setSelectedCliente] = useState("");
  const [clienteNombre, setClienteNombre] = useState("");
  const [clienteTipo, setClienteTipo] = useState<"vip" | "frecuente" | "nuevo">("nuevo");
  const [fecha, setFecha] = useState(todayISO);
  const [monthView, setMonthView] = useState(new Date());
  const [horaInicio, setHoraInicio] = useState("13:00");
  const [horaFin, setHoraFin] = useState("13:15");
  const [estado, setEstado] = useState("confirmada");
  const [notas, setNotas] = useState("");
  const [emailContacto, setEmailContacto] = useState("");
  const [slotsDisponibles, setSlotsDisponibles] = useState<Slot[]>([]);
  const [mesasDisponibles, setMesasDisponibles] = useState<MesaTipo[]>([]);
  const [mesaSeleccionada, setMesaSeleccionada] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const noCatalogs = !negocios.length || !servicios.length || !clientes.length;

  const slots = useMemo(
    () => hours.flatMap((h) => minutes.map((m) => `${String(h).padStart(2, "0")}:${m}`)),
    [],
  );

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem("sirToken") : null;
    setToken(stored);

    if (!stored) {
      setErrorMsg(lang === "es" ? "Inicia sesión para crear citas." : "Sign in to create bookings.");
      return;
    }

    (async () => {
      try {
        const [nRes, sRes, cRes] = await Promise.all([
          fetch(apiUrl("/api/negocios/"), { cache: "no-store", headers: { Authorization: `Token ${stored}` } }),
          fetch(apiUrl("/api/servicios/"), { cache: "no-store", headers: { Authorization: `Token ${stored}` } }),
          fetch(apiUrl("/api/clientes/"), { cache: "no-store", headers: { Authorization: `Token ${stored}` } }),
        ]);
        const [nJson, sJson, cJson] = await Promise.all([nRes.json(), sRes.json(), cRes.json()]);
        setNegocios(Array.isArray(nJson) ? nJson : []);
        setServicios(Array.isArray(sJson) ? sJson : []);
        setClientes(Array.isArray(cJson) ? cJson : []);
        setSelectedNegocio(nJson?.[0]?.id ? String(nJson[0].id) : "");
        setSelectedServicio(sJson?.[0]?.id ? String(sJson[0].id) : "");
        setSelectedCliente(cJson?.[0]?.id ? String(cJson[0].id) : "");
        setClienteNombre(cJson?.[0]?.nombre || "");
      } catch (err) {
        setErrorMsg(lang === "es" ? "No se pudieron cargar catálogos." : "Could not load catalogs.");
      }
    })();
  }, [lang]);

  useEffect(() => {
    setMonthView(new Date(fecha));
  }, [fecha]);

  const handleSelectSlot = (slot: string) => {
    setHoraInicio(slot);
    setHoraFin(addMinutes(slot, 15));
  };

  useEffect(() => {
    (async () => {
      if (!selectedServicio || !fecha || !token) {
        setSlotsDisponibles([]);
        return;
      }
      try {
        const res = await fetch(apiUrl(`/api/agenda/disponibilidad/?servicio=${selectedServicio}&fecha=${fecha}`), {
          cache: "no-store",
          headers: token ? { Authorization: `Token ${token}` } : undefined,
        });
        const data = await res.json().catch(() => []);
        const slotsData: Slot[] = Array.isArray(data) ? data : [];
        setSlotsDisponibles(slotsData);
        if (slotsData.length) {
          setHoraInicio(slotsData[0].hora_inicio);
          setHoraFin(slotsData[0].hora_fin);
        }
      } catch (err) {
        setSlotsDisponibles([]);
      }
    })();
  }, [selectedServicio, fecha]);

  useEffect(() => {
    (async () => {
      if (!selectedServicio || !fecha || !horaInicio || !horaFin) {
        setMesasDisponibles([]);
        return;
      }
      try {
        const res = await fetch(
          apiUrl(
            `/api/mesas/disponibilidad/?servicio=${selectedServicio}&fecha=${fecha}&hora_inicio=${horaInicio}&hora_fin=${horaFin}`,
          ),
          { cache: "no-store" },
        );
        const data = await res.json().catch(() => []);
        const mesasData: MesaTipo[] = Array.isArray(data) ? data : [];
        setMesasDisponibles(mesasData);
        if (mesasData.length && !mesaSeleccionada) setMesaSeleccionada(mesasData[0].id);
      } catch (err) {
        setMesasDisponibles([]);
      }
    })();
  }, [selectedServicio, fecha, horaInicio, horaFin, mesaSeleccionada]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    const token = typeof window !== "undefined" ? window.localStorage.getItem("sirToken") : null;
    setSubmitting(true);
    try {
      const res = await fetch(apiUrl("/api/citas/"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Token ${token}` } : {}),
        },
        body: JSON.stringify({
          negocio: selectedNegocio,
          servicio: selectedServicio,
          cliente: selectedCliente,
          fecha,
          hora_inicio: horaInicio,
          hora_fin: horaFin,
          estado,
          notas: `${emailContacto ? `[Email: ${emailContacto}]` : ""}${mesaSeleccionada ? ` [Mesa: ${mesaSeleccionada}]` : ""} [Tipo:${clienteTipo}${clienteNombre ? ` ${clienteNombre}` : ""}] ${notas}`.trim(),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.detail || "error");
      }
      setSuccessMsg(lang === "es" ? "Cita creada." : "Booking created.");
      setNotas("");
      setEstado("confirmada");
      setHoraInicio("13:00");
      setHoraFin("13:15");
      setEmailContacto("");
      router.refresh();
    } catch (err) {
      setErrorMsg(lang === "es" ? "No se pudo crear la cita." : "Could not create booking.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-1">{lang === "es" ? "Nueva cita" : "New booking"}</h1>
          <p className="text-sm text-slate-400">
            {lang === "es" ? "Crea una reservación para el restaurante." : "Create a new booking for the restaurant."}
          </p>
        </div>
        <a href={`/citas?lang=${lang}`} className="text-sm text-emerald-300 hover:text-emerald-200">
          {lang === "es" ? "← Volver a citas" : "← Back to bookings"}
        </a>
      </header>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4 border border-slate-800 rounded-xl bg-slate-900/40 p-6">
        {noCatalogs && (
          <div className="rounded-lg border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            {lang === "es"
              ? "No hay negocios/servicios/clientes en la base de datos. Crea registros en el panel antes de agendar."
              : "No business/service/client records found. Create them in the admin panel before scheduling."}
          </div>
        )}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-200">Negocio</label>
            <select
              name="negocio"
              value={selectedNegocio}
              onChange={(e) => setSelectedNegocio(e.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              required
              disabled={!negocios.length}
            >
              <option value="">{lang === "es" ? "Selecciona" : "Select"}</option>
              {negocios.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-200">Servicio</label>
            <select
              name="servicio"
              value={selectedServicio}
              onChange={(e) => setSelectedServicio(e.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              required
              disabled={!servicios.length}
            >
              <option value="">{lang === "es" ? "Selecciona" : "Select"}</option>
              {servicios
                .filter((s) => !selectedNegocio || String(s.negocio) === selectedNegocio)
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre}
                  </option>
                ))}
            </select>
          </div>
        </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-200">Cliente</label>
            <select
              name="cliente"
              value={selectedCliente}
              onChange={(e) => setSelectedCliente(e.target.value)}
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            required
            disabled={!clientes.length}
          >
            <option value="">{lang === "es" ? "Selecciona" : "Select"}</option>
            {clientes
              .filter((c) => !selectedNegocio || String(c.negocio) === selectedNegocio)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
          </select>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-200">
              {lang === "es" ? "Nombre completo" : "Full name"}
            </label>
            <input
              type="text"
              value={clienteNombre}
              onChange={(e) => setClienteNombre(e.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              placeholder={lang === "es" ? "Escribe el nombre del cliente" : "Enter client's full name"}
            />
            <p className="text-xs text-slate-500">
              {lang === "es"
                ? "Útil para registrar rápido sin buscar en la lista."
                : "Handy to type the full name even if it's not listed."}
            </p>
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-200">
              {lang === "es" ? "Tipo de cliente" : "Customer type"}
            </label>
            <select
              value={clienteTipo}
              onChange={(e) => setClienteTipo(e.target.value as "vip" | "frecuente" | "nuevo")}
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            >
              <option value="vip">VIP</option>
              <option value="frecuente">{lang === "es" ? "Frecuente" : "Frequent"}</option>
              <option value="nuevo">{lang === "es" ? "Nuevo" : "New"}</option>
            </select>
            <p className="text-xs text-slate-500">
              {lang === "es"
                ? "Marca si es VIP, frecuente o cliente nuevo para identificarlo en el restaurante."
                : "Mark VIP, frequent, or new to identify the guest."}
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{lang === "es" ? "Calendario" : "Calendar"}</p>
                <p className="text-sm text-slate-200">{lang === "es" ? "Selecciona la fecha" : "Pick a date"}</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <button
                  type="button"
                  onClick={() => {
                    const prev = new Date(monthView);
                    prev.setMonth(prev.getMonth() - 1);
                    setMonthView(prev);
                  }}
                  className="rounded-full border border-slate-700 px-2 py-1 hover:border-emerald-400"
                >
                  ←
                </button>
                <span className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-slate-200">
                  {monthView.toLocaleString("es-MX", { month: "long", year: "numeric" })}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const next = new Date(monthView);
                    next.setMonth(next.getMonth() + 1);
                    setMonthView(next);
                  }}
                  className="rounded-full border border-slate-700 px-2 py-1 hover:border-emerald-400"
                >
                  →
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-inner shadow-slate-900/40">
              <div className="grid grid-cols-7 gap-1 text-center text-[11px] uppercase tracking-wide text-slate-400 mb-2">
                {weekDays.map((d, idx) => (
                  <span key={`${d}-${idx}`} className="py-1">
                    {d}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1 text-center">
                {daysInMonth(monthView).map((day, idx) => {
                  if (!day) return <div key={`empty-${idx}`} className="h-9" />;
                  const iso = formatISO(day);
                  const disabled = iso < todayISO || iso > maxDateISO || day.getMonth() !== monthView.getMonth();
                  const selected = iso === fecha;
                  return (
                    <button
                      type="button"
                      key={iso}
                      disabled={disabled}
                      onClick={() => setFecha(iso)}
                      className={`h-9 w-9 rounded-full text-sm transition ${
                        selected
                          ? "bg-emerald-500 text-slate-950 shadow shadow-emerald-500/40"
                          : disabled
                            ? "text-slate-600"
                            : "text-slate-100 hover:bg-emerald-500/10"
                      }`}
                    >
                      {day.getDate()}
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 text-[11px] text-slate-500">
                {lang === "es" ? `Rango permitido: ${todayISO} a ${maxDateISO}` : `Allowed: ${todayISO} to ${maxDateISO}`}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-200">
                  {lang === "es" ? "Hora inicio" : "Start time"}
                </label>
                <input
                  type="time"
                  value={horaInicio}
                  min="13:00"
                  max="23:00"
                  step={15 * 60}
                  onChange={(e) => {
                    setHoraInicio(e.target.value);
                    setHoraFin(addMinutes(e.target.value, 15));
                  }}
                  className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-200">{lang === "es" ? "Hora fin" : "End time"}</label>
                <input
                  type="time"
                  value={horaFin}
                  min="13:00"
                  max="23:59"
                  step={15 * 60}
                  onChange={(e) => setHoraFin(e.target.value)}
                  className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                  required
                />
              </div>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
              <p className="text-xs text-slate-400 mb-2">{lang === "es" ? "Horarios disponibles" : "Available times"}</p>
              <div className="grid grid-cols-4 gap-2 max-h-32 overflow-auto pr-1">
                {slots.map((slot) => {
                  const slotInfo = slotsDisponibles.find((s) => s.hora_inicio === slot);
                  const disponible = !!slotInfo;
                  return (
                    <button
                      type="button"
                      key={slot}
                      disabled={!disponible}
                      onClick={() => disponible && handleSelectSlot(slot)}
                      className={`rounded-md border px-2 py-1 text-xs ${
                        horaInicio === slot
                          ? "border-emerald-400 bg-emerald-500/10 text-emerald-100"
                          : disponible
                            ? "border-slate-700 bg-slate-900 text-slate-200 hover:border-emerald-400"
                            : "border-slate-800 bg-slate-900/40 text-slate-600 cursor-not-allowed"
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-[11px] text-slate-500">
                {lang === "es" ? "Horarios 13:00 - 23:00, incrementos de 15 min. Tolerancia 15 min." : "Hours 1pm-11pm, 15 min steps. 15 min grace."}
              </p>
            </div>
        </div>
      </div>

        <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                {lang === "es" ? "Mesas" : "Tables"}
              </p>
              <p className="text-sm text-slate-200">
                {lang === "es" ? "Disponibles / ocupadas" : "Available / occupied"}
              </p>
            </div>
            <span className="text-[11px] text-slate-500">
              {fecha} · {horaInicio} - {horaFin}
            </span>
          </div>
          {mesasDisponibles.length === 0 ? (
            <p className="text-xs text-slate-400">
              {lang === "es" ? "Sin datos de mesas para esta fecha/horario." : "No table data for this date/time."}
            </p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {mesasDisponibles.map((m) => {
                const libres = Math.max(m.total - m.ocupadas, 0);
                const selected = mesaSeleccionada === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMesaSeleccionada(m.id)}
                    className={`flex flex-col gap-1 rounded-xl border px-3 py-3 text-left text-sm transition ${
                      selected
                        ? "border-emerald-400 bg-emerald-500/10 text-emerald-100 shadow shadow-emerald-500/30"
                        : "border-slate-800 bg-slate-900/70 text-slate-100 hover:border-emerald-400"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{m.nombre}</span>
                      <span className={`text-xs font-semibold ${selected ? "text-amber-200" : "text-amber-300"}`}>
                        {libres} / {m.total}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      {lang === "es" ? `Capacidad ${m.capacidad} pax` : `Capacity ${m.capacidad} pax`}
                    </p>
                    <p className="text-xs text-emerald-100">
                      {lang === "es" ? `Precio: $${m.precio}` : `Price: $${m.precio}`}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-200">{lang === "es" ? "Correo para confirmación" : "Email for confirmation"}</label>
          <input
            type="email"
            value={emailContacto}
            onChange={(e) => setEmailContacto(e.target.value)}
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            placeholder={lang === "es" ? "ejemplo@correo.com" : "email@example.com"}
            required
          />
          <p className="text-xs text-slate-500">
            {lang === "es"
              ? "Usaremos este correo para enviar la confirmación y agregar a Google Calendar."
              : "We will use this email to send confirmation and add to Google Calendar."}
          </p>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-200">Estado</label>
          <select
            name="estado"
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
          >
            <option value="pendiente">{lang === "es" ? "Pendiente" : "Pending"}</option>
            <option value="confirmada">{lang === "es" ? "Confirmada" : "Confirmed"}</option>
            <option value="cancelada">{lang === "es" ? "Cancelada" : "Cancelled"}</option>
            <option value="completada">{lang === "es" ? "Completada" : "Completed"}</option>
            <option value="no_asistio">{lang === "es" ? "No asistió" : "No show"}</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-200">Notas</label>
          <textarea
            name="notas"
            rows={3}
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            placeholder={lang === "es" ? "Ej: mesa cerca de la ventana, cumpleaños" : "Notes"}
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
          >
            {lang === "es" ? "Guardar cita" : "Save booking"}
          </button>
          <a href={`/citas?lang=${lang}`} className="text-sm text-slate-400 hover:text-slate-200">
            {lang === "es" ? "Cancelar" : "Cancel"}
          </a>
        </div>

        {successMsg && <p className="text-sm text-emerald-300">{successMsg}</p>}
        {errorMsg && <p className="text-sm text-rose-300">{errorMsg}</p>}
      </form>
    </main>
  );
}
