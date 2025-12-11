// src/app/page.tsx

import Image from "next/image";

const menuDestacados = [
  {
    titulo: 'Guacamole "El Patrón"',
    descripcion: "Molcajete al momento con chicharrón de Ribeye y totopos de maíz azul.",
    precio: "$260",
    imagen: "/images/guacamole-patron.png",
  },
  {
    titulo: "Enchiladas de Mole Poblano",
    descripcion: "Pollo orgánico, mole artesanal y ajonjolí tostado.",
    precio: "$320",
    imagen: "/images/enchiladas-mole.png",
  },
  {
    titulo: "Arrachera Angus",
    descripcion: "350g al carbón, nopal, chiles toreados y cebollitas.",
    precio: "$550",
    imagen: "/images/arrachera-angus.png",
  },
  {
    titulo: "Cantarito de Lujo",
    descripcion: "Tequila, cítricos y sal de gusano en jarrito de barro.",
    precio: "$190",
    imagen: "/images/cantarito-lujo.png",
  },
];

const especiales = [
  { titulo: "Lunes de Sopes", detalle: "3 sopes + agua fresca", precio: "$95" },
  { titulo: "Miércoles de Enchiladas", detalle: "Orden + margarita", precio: "$135" },
  { titulo: "Domingo Brunch", detalle: "Chilaquiles + mimosa", precio: "$149" },
];

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
              Sabor auténtico y agenda inteligente para tu mesa
            </h1>
            <p className="text-slate-300">
              Reserva en segundos, confirma disponibilidad real y recibe tu cita en Google Calendar con recordatorios
              automáticos.
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
              <a
                href="/menu"
                className="inline-flex items-center gap-2 rounded-full border border-amber-200/50 px-6 py-3 text-sm font-semibold text-amber-100 transition hover:bg-amber-200/10"
              >
                Ver menú
              </a>
            </div>
          </div>
          <div className="grid w-full max-w-xl grid-cols-2 gap-3 rounded-2xl border border-amber-500/10 bg-slate-900/50 p-4 shadow-xl shadow-amber-500/15">
            {menuDestacados.slice(0, 4).map((item) => (
              <div key={item.titulo} className="overflow-hidden rounded-xl border border-slate-800/80 bg-slate-900/80">
                <div className="relative h-28 w-full">
                  <Image
                    src={item.imagen}
                    alt={item.titulo}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 180px, 50vw"
                    priority
                  />
                </div>
                <div className="p-3 space-y-1">
                  <p className="text-sm font-semibold text-amber-200">{item.titulo}</p>
                  <p className="text-xs text-slate-300">{item.descripcion}</p>
                  <p className="pt-1 text-sm font-semibold text-amber-300">{item.precio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-white/5 py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Especialidades de la casa</h2>
              <p className="text-slate-400">Sabores clásicos listos para tu siguiente visita.</p>
            </div>
            <a
              href="/reservar"
              className="inline-flex items-center gap-2 rounded-full border border-amber-300/70 bg-slate-900/70 px-5 py-2.5 text-sm font-semibold text-amber-200 shadow-sm transition hover:bg-amber-200/10"
            >
              Agendar ahora →
            </a>
          </div>
          <div className="grid gap-6 md:grid-cols-4">
            {menuDestacados.map((item) => (
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
        <div className="mx-auto grid max-w-6xl gap-8 px-6 md:grid-cols-3">
          {especiales.map((esp) => (
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
              Cocina mexicana auténtica con servicio cálido y reservas inteligentes.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide">Horarios</h4>
            <ul className="text-sm">
              <li>Lunes a Domingo: 13:00 - 23:00</li>
              <li>Reservas en línea 24/7</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide">Contacto</h4>
            <ul className="text-sm">
              <li>Av. Central 102, Guadalajara</li>
              <li>Tel: 332 233 2211</li>
              <li>correo: contacto@elmirador.mx</li>
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
