import Image from "next/image";
import {
  bebidasSin,
  cervezas,
  cocteles,
  entretenimiento,
  entradas,
  fuertes,
  MenuItem,
  postres,
  promos,
  sopas,
  vipBotellas,
} from "@/lib/menu-data";

type SectionGridProps = {
  title: string;
  items: MenuItem[];
};

function SectionGrid({ title, items }: SectionGridProps) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-amber-300">{title}</h2>
        <a href="/reservar" className="text-sm text-amber-200 hover:text-amber-100 underline underline-offset-4">
          Agendar mesa →
        </a>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.nombre}
            className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 shadow-lg shadow-slate-900/50"
          >
            {item.imagen && (
              <div className="relative h-40 w-full">
                <Image
                  src={item.imagen}
                  alt={item.nombre}
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 420px, 90vw"
                />
              </div>
            )}
            <div className="space-y-2 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold">{item.nombre}</p>
                  <p className="text-sm text-slate-300">{item.detalle}</p>
                </div>
                {item.precio && <span className="text-sm font-semibold text-amber-300">{item.precio}</span>}
              </div>
              {item.tag && (
                <span className="inline-flex rounded-full border border-amber-300/40 px-3 py-1 text-xs text-amber-200">
                  {item.tag}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function MenuContent() {
  return (
    <>
      <SectionGrid title="Entradas y Antojitos" items={entradas} />
      <SectionGrid title="Sopas y Ensaladas" items={sopas} />
      <SectionGrid title="Platos Fuertes" items={fuertes} />
      <SectionGrid title="Postres" items={postres} />

      <section id="bebidas" className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <h3 className="text-xl font-semibold text-amber-300">Bebidas sin alcohol</h3>
            <ul className="mt-3 space-y-3 text-sm text-slate-200">
              {bebidasSin.map((b) => (
                <li key={b.nombre} className="space-y-1 rounded-xl border border-slate-800/70 bg-slate-900/80 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-semibold">{b.nombre}</span>
                    <span className="text-amber-200">{b.precio}</span>
                  </div>
                  <p className="text-slate-400">{b.detalle}</p>
                  {b.sabores && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {b.sabores.map((sabor) => (
                        <span
                          key={sabor}
                          className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-xs text-amber-100"
                        >
                          {sabor}
                        </span>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <h3 className="text-xl font-semibold text-amber-300">Coctelería de la casa</h3>
            <ul className="mt-3 space-y-3 text-sm text-slate-200">
              {cocteles.map((c) => (
                <li key={c.nombre} className="space-y-1 rounded-xl border border-slate-800/70 bg-slate-900/80 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{c.nombre}</p>
                      <p className="text-slate-400">{c.detalle}</p>
                    </div>
                    <span className="text-amber-200">{c.precio}</span>
                  </div>
                  {c.sabores && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {c.sabores.map((sabor) => (
                        <span
                          key={sabor}
                          className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-xs text-amber-100"
                        >
                          {sabor}
                        </span>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <h3 className="text-xl font-semibold text-amber-300">Cervezas</h3>
            <ul className="mt-3 space-y-3 text-sm text-slate-200">
              {cervezas.map((c) => (
                <li key={c.nombre} className="space-y-1 rounded-xl border border-slate-800/70 bg-slate-900/80 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{c.nombre}</p>
                      <p className="text-slate-400">{c.detalle}</p>
                    </div>
                    <span className="text-amber-200">{c.precio}</span>
                  </div>
                  {c.sabores && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {c.sabores.map((sabor) => (
                        <span
                          key={sabor}
                          className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-xs text-amber-100"
                        >
                          {sabor}
                        </span>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-800 py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-amber-200">Zona VIP El Mirador</p>
              <h2 className="text-3xl font-semibold text-white">Solo adultos · Cover $300 MXN</h2>
              <p className="text-emerald-50">
                Mesa preferencial, mesero dedicado y botana seca gourmet ilimitada.
              </p>
            </div>
            <a
              href="/reservar"
              className="rounded-lg bg-amber-300 px-5 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-emerald-900/40 hover:bg-amber-200"
            >
              Reservar en VIP
            </a>
          </div>
          <div className="rounded-2xl border border-emerald-400/50 bg-white/10 p-6 shadow-xl shadow-emerald-900/40">
            <h3 className="text-xl font-semibold text-amber-200">Bottle Service (incluye 5 mezcladores)</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {vipBotellas.map((b) => (
                <div
                  key={b.nombre}
                  className="flex items-start justify-between rounded-xl border border-white/15 bg-white/5 p-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">{b.nombre}</p>
                    <p className="text-xs text-emerald-50/80">{b.detalle}</p>
                  </div>
                  <span className="text-sm font-semibold text-amber-200">{b.precio}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <h3 className="text-xl font-semibold text-amber-300">Entretenimiento · Talento local</h3>
            <ul className="mt-3 space-y-3 text-sm text-slate-200">
              {entretenimiento.map((e) => (
                <li key={e.nombre} className="space-y-1 rounded-xl border border-slate-800/70 bg-slate-900/80 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{e.nombre}</p>
                      <p className="text-slate-400">{e.detalle}</p>
                    </div>
                    {e.precio && <span className="text-amber-200">{e.precio}</span>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <h3 className="text-xl font-semibold text-amber-300">Promociones</h3>
            <ul className="mt-3 space-y-3 text-sm text-slate-200">
              {promos.map((p) => (
                <li key={p.nombre} className="space-y-1 rounded-xl border border-slate-800/70 bg-slate-900/80 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{p.nombre}</p>
                      <p className="text-slate-400">{p.detalle}</p>
                    </div>
                    {p.precio && <span className="text-amber-200">{p.precio}</span>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-14">
        <div className="rounded-2xl border border-amber-300/30 bg-amber-400/10 p-6 text-slate-100">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-amber-200">Agenda inteligente</p>
              <h3 className="text-2xl font-semibold text-white">Reserva tu mesa en segundos</h3>
              <p className="text-sm text-amber-100">
                Disponibilidad en tiempo real, sincronización con Google Calendar y recordatorios automáticos.
              </p>
            </div>
            <div className="flex gap-3">
              <a
                href="/reservar"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-amber-300 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-500/40 ring-1 ring-amber-300/60 transition hover:shadow-xl hover:-translate-y-0.5"
              >
                Agendar ahora
              </a>
              <a
                href="/citas"
                className="inline-flex items-center gap-2 rounded-full border border-amber-200/60 bg-slate-900/70 px-6 py-3 text-sm font-semibold text-amber-100 shadow-inner shadow-amber-500/10 transition hover:border-amber-200 hover:bg-slate-900/80"
              >
                Ver panel
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
