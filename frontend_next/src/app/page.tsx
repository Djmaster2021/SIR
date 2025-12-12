// src/app/page.tsx

import Image from "next/image";
import {
  bebidasSin,
  cervezas,
  cocteles,
  destacados,
  entretenimiento,
  entradas,
  especialesSemana,
  fuertes,
  postres,
  promos,
} from "@/lib/menu-data";

type SectionProps = {
  titulo: string;
  items: {
    titulo: string;
    descripcion: string;
    precio?: string;
    imagen?: string;
  }[];
};

function SectionGrid({ titulo, items }: SectionProps) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-amber-200">Selección</p>
          <h2 className="text-2xl font-semibold">{titulo}</h2>
        </div>
        <a
          href="/reservar"
          className="inline-flex items-center gap-2 rounded-full border border-amber-300/70 bg-slate-900/70 px-5 py-2.5 text-sm font-semibold text-amber-200 shadow-sm transition hover:bg-amber-200/10"
        >
          Agendar ahora →
        </a>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.titulo}
            className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 shadow-lg shadow-slate-900/50"
          >
            {item.imagen && (
              <div className="relative h-48 w-full">
                <Image
                  src={item.imagen}
                  alt={item.titulo}
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 420px, 90vw"
                  priority={titulo === "Entradas y Antojitos"}
                />
              </div>
            )}
            <div className="space-y-2 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold">{item.titulo}</p>
                  <p className="text-sm text-slate-300">{item.descripcion}</p>
                </div>
                {item.precio && <span className="text-sm font-semibold text-amber-300">{item.precio}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/15 via-slate-900 to-slate-950" />
        <div className="absolute inset-x-0 top-0 h-80 bg-[url('/images/arrachera-angus.png')] bg-cover bg-center opacity-30" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-6 py-16 lg:flex-row lg:items-center">
          <div className="max-w-2xl space-y-4">
            <p className="text-sm uppercase tracking-[0.25em] text-amber-300">Cocina Mexicana</p>
            <h1 className="text-4xl font-bold leading-tight md:text-5xl">
              RESTAURANTE EL MIRADOR
            </h1>
            <p className="text-slate-300">
              Disfruta sabores caseros, cortes al carbón y mixología de la casa en un ambiente cálido. Reserva tu mesa en
              segundos y recibe confirmación y recordatorios automáticos.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="/reservar"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-amber-300 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-500/40 ring-1 ring-amber-300/60 transition hover:shadow-xl hover:-translate-y-0.5"
              >
                Agendar mesa
              </a>
              <a
                href="/citas"
                className="inline-flex items-center gap-2 rounded-full border border-amber-300/60 bg-slate-900/60 px-6 py-3 text-sm font-semibold text-amber-100 shadow-inner shadow-amber-500/10 transition hover:border-amber-200 hover:bg-slate-900/80"
              >
                Panel de citas
              </a>
            </div>
          </div>
        </div>
      </section>
      <SectionGrid
        titulo="Entradas y Antojitos"
        items={entradas.map((item) => ({
          titulo: item.nombre,
          descripcion: item.detalle,
          precio: item.precio,
          imagen: item.imagen,
        }))}
      />

      <SectionGrid
        titulo="Platos fuertes"
        items={fuertes.map((item) => ({
          titulo: item.nombre,
          descripcion: item.detalle,
          precio: item.precio,
          imagen: item.imagen,
        }))}
      />

      <section className="relative overflow-hidden bg-white/5 py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-amber-200">Recomendados</p>
              <h2 className="text-2xl font-semibold">Especialidades del menú</h2>
              <p className="text-slate-400">Nuestros favoritos listos para reservar y disfrutar.</p>
            </div>
            <a
              href="/reservar"
              className="inline-flex items-center gap-2 rounded-full border border-amber-300/70 bg-slate-900/70 px-5 py-2.5 text-sm font-semibold text-amber-200 shadow-sm transition hover:bg-amber-200/10"
            >
              Agendar ahora →
            </a>
          </div>
          <div className="grid gap-6 md:grid-cols-4">
            {destacados.map((item) => (
              <div
                key={item.titulo}
                className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-md shadow-slate-900/50"
              >
                <div className="relative h-32 w-full">
                  <Image
                    src={item.imagen}
                    alt={item.titulo}
                    fill
                    className="object-cover"
                    sizes="(min-width: 768px) 240px, 90vw"
                  />
                </div>
                <div className="space-y-1 p-4">
                  <p className="text-base font-semibold">{item.titulo}</p>
                  <p className="text-sm text-slate-400">{item.descripcion}</p>
                  <p className="text-sm font-semibold text-amber-300">{item.precio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-800 py-10">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-amber-200">Promociones del día</p>
              <h2 className="text-3xl font-semibold text-white">Aprovecha hoy</h2>
            </div>
            <a
              href="/reservar"
              className="rounded-lg bg-amber-300 px-5 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-emerald-900/40 hover:bg-amber-200"
            >
              Reservar ahora
            </a>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {especialesSemana.map((esp) => (
              <div
                key={esp.titulo}
                className="rounded-2xl border border-emerald-500/50 bg-white/10 p-5 text-center text-emerald-50 shadow-lg shadow-emerald-900/40"
              >
                <h3 className="text-xl font-semibold">{esp.titulo}</h3>
                <p className="mt-2 text-sm text-emerald-100">{esp.detalle}</p>
                <p className="mt-3 text-lg font-semibold text-amber-200">{esp.precio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SectionGrid
        titulo="Postres"
        items={postres.map((item) => ({
          titulo: item.nombre,
          descripcion: item.detalle,
          precio: item.precio,
          imagen: item.imagen,
        }))}
      />

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-amber-200">Bebidas</p>
            <h2 className="text-2xl font-semibold">Aguas frescas, coctelería y cervezas</h2>
            <p className="text-slate-300">Opciones sin alcohol, cocteles de la casa y cervezas bien frías.</p>
          </div>
          <a
            href="/reservar"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400"
          >
            Agendar mesa
          </a>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <h3 className="text-xl font-semibold text-amber-300">Sin alcohol</h3>
            <ul className="mt-3 space-y-3 text-sm text-slate-200">
              {bebidasSin.map((b) => (
                <li key={b.nombre} className="space-y-1 rounded-xl border border-slate-800/70 bg-slate-900/80 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-semibold">{b.nombre}</span>
                    <span className="text-amber-200">{b.precio}</span>
                  </div>
                  <p className="text-slate-400">{b.detalle}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <h3 className="text-xl font-semibold text-amber-300">Coctelería</h3>
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
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-amber-300/40 bg-amber-400/10 p-6 shadow-lg shadow-amber-500/20">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-200">Kit de cumpleaños</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">Celebración VIP para cumpleañeros</h3>
            <p className="mt-2 text-slate-200">
              Zona VIP, bengalas, mañanitas y vino espumoso de cortesía al comprar 2 botellas nacionales.
            </p>
            <ul className="mt-3 space-y-2 text-sm text-slate-100">
              <li>✓ Mesa preferencial en área VIP</li>
              <li>✓ Decoración, bengalas y brindis</li>
              <li>✓ Botana seca gourmet incluida</li>
            </ul>
            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href="/reservar"
                className="rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-md shadow-emerald-500/30 hover:bg-emerald-400"
              >
                Reservar kit
              </a>
              {promos[0] && <span className="text-sm font-semibold text-amber-200">{promos[0].precio}</span>}
            </div>
          </div>
          <div className="rounded-2xl border border-emerald-400/40 bg-emerald-400/10 p-6 shadow-lg shadow-emerald-900/30">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">Actividades</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">Música y ambiente</h3>
            <ul className="mt-3 space-y-3 text-sm text-emerald-50">
              {entretenimiento.map((e) => (
                <li key={e.nombre} className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{e.nombre}</p>
                      <p className="text-emerald-50/80">{e.detalle}</p>
                    </div>
                    {e.precio && <span className="text-amber-200">{e.precio}</span>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-slate-800 shadow-xl shadow-slate-900/60">
            <div className="h-72 w-full bg-[url('https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=1400&q=80')] bg-cover bg-center" />
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Desde 2004 sirviendo sabores mexicanos</h2>
            <p className="text-slate-300">
              Tradición familiar, ingredientes frescos y ahora un sistema de citas inteligente que sincroniza tu
              reservación en Google Calendar. Sin llamadas, sin esperas.
            </p>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>✓ Disponibilidad en tiempo real por mesa</li>
              <li>✓ Confirmaciones y recordatorios automáticos</li>
              <li>✓ Recomendaciones de horario para evitar filas</li>
            </ul>
            <div className="flex gap-3">
              <a
                href="/reservar"
                className="rounded-lg bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-900 shadow-md shadow-emerald-500/30 hover:bg-emerald-400"
              >
                Agendar visita
              </a>
              <a
                href="/config/calendar"
                className="rounded-lg border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-100 hover:border-emerald-300"
              >
                Ver estado de Calendar
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-amber-500/90 text-slate-900">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 md:grid-cols-3">
          <div>
            <h3 className="text-lg font-semibold">El Mirador</h3>
            <p className="text-sm">
              Cocina mexicana auténtica con servicio cálido y reservas inteligentes en un solo clic.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide">Horarios</h4>
            <ul className="text-sm">
              <li>Lunes a Domingo: 13:00 – 23:00</li>
              <li>Reservas en línea 24/7</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide">Contacto</h4>
            <ul className="text-sm">
              <li>Av. Central 102, Guadalajara</li>
              <li>Tel: (33) 2233 2211</li>
              <li>Correo: contacto@elmirador.mx</li>
            </ul>
            <div className="mt-3 flex gap-3 text-sm font-semibold">
              <a href="/reservar" className="underline decoration-slate-900/60 underline-offset-4">
                Agendar
              </a>
              <a href="/citas" className="underline decoration-slate-900/60 underline-offset-4">
                Panel
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
