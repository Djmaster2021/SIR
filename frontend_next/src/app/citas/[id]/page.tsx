import React from "react";
import { apiUrl } from "@/lib/api";

type CitaDetalle = {
  id: number;
  negocio_nombre: string;
  servicio_nombre: string;
  cliente_nombre: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: string;
  notas: string;
};

async function getCita(id: string): Promise<CitaDetalle | null> {
  const res = await fetch(apiUrl(`/api/citas/${id}/`), {
    cache: "no-store",
  });

  if (!res.ok) {
    console.error("Error al cargar cita", id, res.status);
    return null;
  }

  return res.json();
}

const ESTADOS = ["pendiente", "confirmada", "cancelada", "completada", "no_asistio"];

export default async function CitaDetallePage({
  params,
}: {
  params: { id: string };
}) {
  const cita = await getCita(params.id);

  if (!cita) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 p-8">
        <h1 className="text-2xl font-bold mb-4">Cita no encontrada</h1>
        <a href="/citas" className="text-sky-400 hover:text-sky-200 text-sm">
          ← Volver al listado
        </a>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Cita #{cita.id}</h1>
          <p className="text-sm text-slate-400">
            {cita.negocio_nombre} — {cita.servicio_nombre}
          </p>
          <p className="text-sm text-slate-400">Cliente: {cita.cliente_nombre}</p>
        </div>
        <a href="/citas" className="text-sm text-slate-400 hover:text-slate-200">
          ← Volver a citas
        </a>
      </header>

      <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
        <form
          action={`/api/sir/citas/${cita.id}/update`}
          method="post"
          className="space-y-4 border border-slate-800 rounded-xl bg-slate-900/40 p-6"
        >
          <h2 className="text-lg font-semibold mb-2">Editar cita</h2>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-200">Fecha</label>
            <input
              type="text"
              value={cita.fecha}
              readOnly
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-400"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-200">Hora</label>
            <input
              type="text"
              value={`${cita.hora_inicio} – ${cita.hora_fin}`}
              readOnly
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-400"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-200">Estado</label>
            <select
              name="estado"
              defaultValue={cita.estado}
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            >
              {ESTADOS.map((e) => (
                <option key={e} value={e}>
                  {e.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-200">Notas</label>
            <textarea
              name="notas"
              defaultValue={cita.notas}
              rows={3}
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
            >
              Guardar cambios
            </button>
          </div>
        </form>

        <form
          action={`/api/sir/citas/${cita.id}/delete`}
          method="post"
          className="h-fit border border-rose-700/60 rounded-xl bg-rose-950/20 p-6 space-y-3"
        >
          <h2 className="text-sm font-semibold text-rose-300">Eliminar cita</h2>
          <p className="text-xs text-rose-200/80">
            Esta acción eliminará la cita de forma permanente.
          </p>
          <button
            type="submit"
            className="w-full rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-slate-50 hover:bg-rose-500"
          >
            Eliminar cita
          </button>
        </form>
      </div>
    </main>
  );
}
