import Link from "next/link";
import { apiUrl } from "@/lib/api";

type CalendarStatus = {
  authorized: boolean;
  calendar_id: string;
  updated_at?: string | null;
  token_expiry?: string | null;
  scopes?: string[];
};

async function getStatus(): Promise<CalendarStatus | null> {
  const res = await fetch(apiUrl("/api/google/status/"), { cache: "no-store" });
  if (!res.ok) {
    console.error("No se pudo obtener estado de Calendar:", res.status);
    return null;
  }
  return res.json();
}

export default async function CalendarConfigPage() {
  const status = await getStatus();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 px-6 py-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-emerald-400">
              Integración Google Calendar
            </p>
            <h1 className="text-3xl font-semibold text-slate-50">
              Sincronización y estado
            </h1>
            <p className="text-slate-400">
              Revisa autorización, cambia el calendar destino y fuerza un resync
              de eventos.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/citas"
              className="rounded-lg border border-slate-800 px-4 py-2 text-sm text-slate-200 hover:border-slate-700 hover:bg-slate-900"
            >
              ← Volver a citas
            </Link>
            <Link
              href={apiUrl("/api/google/authorize/")}
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-emerald-500/30 hover:bg-emerald-400"
            >
              Reautorizar con Google
            </Link>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Estado</h2>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  status?.authorized
                    ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/40"
                    : "bg-rose-500/15 text-rose-300 border border-rose-500/40"
                }`}
              >
                {status?.authorized ? "Autorizado" : "Sin autorización"}
              </span>
            </div>
            {status ? (
              <dl className="space-y-2 text-sm text-slate-300">
                <div className="flex justify-between">
                  <dt className="text-slate-400">Calendar ID</dt>
                  <dd className="font-mono text-emerald-200">
                    {status.calendar_id}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-400">Última actualización</dt>
                  <dd>{status.updated_at ?? "—"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-400">Expira token</dt>
                  <dd>{status.token_expiry ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-slate-400">Scopes</dt>
                  <dd className="text-xs text-slate-300">
                    {(status.scopes || []).join(", ") || "—"}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="text-sm text-rose-300">
                No se pudo obtener el estado. Intenta más tarde.
              </p>
            )}
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
            <h2 className="text-lg font-semibold">Cambiar calendario</h2>
            <p className="text-sm text-slate-400">
              Define el ID del calendario destino (por ejemplo, otra agenda).
              Opción de resincronizar todas las citas futuras tras el cambio.
            </p>
            <form
              action="/api/sir/google/calendar"
              method="POST"
              className="space-y-3"
            >
              <label className="block text-sm text-slate-200">
                Calendar ID
                <input
                  name="calendar_id"
                  defaultValue={status?.calendar_id || "primary"}
                  className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none"
                  required
                />
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  name="resync"
                  className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                />
                Re-sincronizar citas futuras después de guardar
              </label>
              <button
                type="submit"
                className="w-full rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-900 shadow shadow-emerald-500/40 hover:bg-emerald-400"
              >
                Guardar calendario
              </button>
            </form>
          </div>
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Resync manual</h2>
              <p className="text-sm text-slate-400">
                Recrea eventos faltantes y actualiza cambios en Google Calendar.
              </p>
            </div>
          </div>
          <form
            action="/api/sir/google/resync"
            method="POST"
            className="flex flex-col gap-3 md:flex-row md:items-center"
          >
            <label className="text-sm text-slate-200 md:w-1/3">
              Límite de citas a procesar
              <input
                name="limit"
                defaultValue="200"
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none"
              />
            </label>
            <button
              type="submit"
              className="md:w-auto rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-800"
            >
              Ejecutar resync ahora
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
