// src/app/citas/page.tsx
import Link from "next/link";
import { apiUrl } from "@/lib/api";

type Cita = {
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

async function getCitas(): Promise<Cita[]> {
  const res = await fetch(apiUrl("/api/citas/"), {
    cache: "no-store",
  });

  if (!res.ok) {
    console.error("Error al cargar citas. Status:", res.status);
    return [];
  }

  return res.json();
}

function estadoClase(estado: string): string {
  switch (estado) {
    case "confirmada":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/40";
    case "pendiente":
      return "bg-amber-500/10 text-amber-400 border-amber-500/40";
    case "cancelada":
      return "bg-rose-500/10 text-rose-400 border-rose-500/40";
    case "completada":
      return "bg-sky-500/10 text-sky-400 border-sky-500/40";
    case "no_asistio":
      return "bg-red-500/10 text-red-400 border-red-500/40";
    default:
      return "bg-slate-700/40 text-slate-200 border-slate-500/40";
  }
}

export default async function CitasPage() {
  const citas = await getCitas();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Citas</h1>
          <p className="text-slate-400">
            Listado de citas registradas en el sistema SIR. Obtenidas desde{" "}
            <code>/api/citas/</code>.
          </p>
        </div>

        <Link
          href="/citas/nueva"
          className="inline-flex items-center rounded-lg border border-emerald-500/60 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-300 hover:bg-emerald-500/20"
        >
          + Nueva cita
        </Link>
      </header>

      <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/40">
        <table className="w-full text-sm">
          <thead className="bg-slate-900/80">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Negocio</th>
              <th className="p-3 text-left">Servicio</th>
              <th className="p-3 text-left">Cliente</th>
              <th className="p-3 text-left">Fecha</th>
              <th className="p-3 text-left">Hora</th>
              <th className="p-3 text-left">Estado</th>
              <th className="p-3 text-left">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {citas.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-6 text-center text-slate-500">
                  No hay citas registradas aún.
                </td>
              </tr>
            ) : (
              citas.map((cita) => (
                <tr
                  key={cita.id}
                  className="border-t border-slate-800 hover:bg-slate-900 transition-colors"
                >
                  <td className="p-3">{cita.id}</td>
                  <td className="p-3">{cita.negocio_nombre}</td>
                  <td className="p-3">{cita.servicio_nombre}</td>
                  <td className="p-3">{cita.cliente_nombre}</td>
                  <td className="p-3">{cita.fecha}</td>
                  <td className="p-3">
                    {cita.hora_inicio} – {cita.hora_fin}
                  </td>
                  <td className="p-3">
                    <span
                      className={
                        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium " +
                        estadoClase(cita.estado)
                      }
                    >
                      {cita.estado.replace("_", " ")}
                    </span>
                  </td>
                  <td className="p-3">
                    <Link
                      href={`/citas/${cita.id}`}
                      className="text-xs text-sky-400 hover:text-sky-200"
                    >
                      Ver / editar
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
