import { apiUrl } from "@/lib/api";

// src/app/citas/nueva/page.tsx

type Negocio = {
    id: number;
    nombre: string;
  };
  
  type Servicio = {
    id: number;
    nombre: string;
    negocio: number;
  };
  
  type Cliente = {
    id: number;
    nombre: string;
    negocio: number;
  };
  
  // Fechas límite para el calendario
  const todayISO = new Date().toISOString().slice(0, 10);
  // máximo 60 días adelante (ajustable)
  const maxDateISO = new Date(
    Date.now() + 60 * 24 * 60 * 60 * 1000
  ).toISOString().slice(0, 10);
  
  async function getNegocios(): Promise<Negocio[]> {
    const res = await fetch(apiUrl("/api/negocios/"), {
      cache: "no-store",
    });
    if (!res.ok) return [];
    return res.json();
  }
  
  async function getServicios(): Promise<Servicio[]> {
    const res = await fetch(apiUrl("/api/servicios/"), {
      cache: "no-store",
    });
    if (!res.ok) return [];
    return res.json();
  }
  
  async function getClientes(): Promise<Cliente[]> {
    const res = await fetch(apiUrl("/api/clientes/"), {
      cache: "no-store",
    });
    if (!res.ok) return [];
    return res.json();
  }
  
  export default async function NuevaCitaPage() {
    const [negocios, servicios, clientes] = await Promise.all([
      getNegocios(),
      getServicios(),
      getClientes(),
    ]);
  
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 p-8">
        <header className="mb-6">
          <h1 className="text-3xl font-bold mb-1">Nueva cita</h1>
          <p className="text-sm text-slate-400">
            Crea una nueva reservación para el restaurante.
          </p>
        </header>
  
        <form
          action="/api/sir/citas"
          method="post"
          className="max-w-xl space-y-4 border border-slate-800 rounded-xl bg-slate-900/40 p-6"
        >
          {/* Negocio */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-200">
              Negocio
            </label>
            <select
              name="negocio"
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              required
            >
              <option value="">Selecciona un negocio</option>
              {negocios.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.nombre}
                </option>
              ))}
            </select>
          </div>
  
          {/* Servicio */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-200">
              Servicio (tipo de mesa)
            </label>
            <select
              name="servicio"
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              required
            >
              <option value="">Selecciona un servicio</option>
              {servicios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </div>
  
          {/* Cliente */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-200">
              Cliente
            </label>
            <select
              name="cliente"
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              required
            >
              <option value="">Selecciona un cliente</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>
  
          {/* Fecha */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-200">
              Fecha
            </label>
            <input
              type="date"
              name="fecha"
              min={todayISO}
              max={maxDateISO}
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              required
            />
            <p className="text-xs text-slate-500">
              Solo se permiten fechas desde hoy hasta {maxDateISO}.
            </p>
          </div>
  
          {/* Hora inicio / fin */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-200">
                Hora inicio
              </label>
              <input
                type="time"
                name="hora_inicio"
                min="13:00"
                max="23:00"
                step={15 * 60}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-200">
                Hora fin
              </label>
              <input
                type="time"
                name="hora_fin"
                min="13:00"
                max="23:00"
                step={15 * 60}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                required
              />
            </div>
          </div>
  
          {/* Estado */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-200">
              Estado
            </label>
            <select
              name="estado"
              defaultValue="confirmada"
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            >
              <option value="pendiente">Pendiente</option>
              <option value="confirmada">Confirmada</option>
              <option value="cancelada">Cancelada</option>
              <option value="completada">Completada</option>
              <option value="no_asistio">No asistió</option>
            </select>
          </div>
  
          {/* Notas */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-200">
              Notas
            </label>
            <textarea
              name="notas"
              rows={3}
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              placeholder="Ej: mesa cerca de la ventana, cumpleaños, etc."
            />
          </div>
  
          {/* Botones */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
            >
              Guardar cita
            </button>
            <a
              href="/citas"
              className="text-sm text-slate-400 hover:text-slate-200"
            >
              Cancelar
            </a>
          </div>
        </form>
      </main>
    );
  }
  
