import Image from "next/image";

type Item = {
  nombre: string;
  detalle: string;
  precio?: string;
  tag?: string;
  imagen?: string;
  sabores?: string[];
};

const entradas: Item[] = [
  {
    nombre: 'Guacamole "El Patrón"',
    detalle: "Aguacate en molcajete, chicharrón de Ribeye y totopos de maíz azul.",
    precio: "$260",
    imagen: "/images/guacamole-patron.png",
  },
  {
    nombre: "Tuétanos a la Parrilla (3 pzas)",
    detalle: "Huesos al carbón con esquites y epazote, tortillas hechas a mano.",
    precio: "$380",
    imagen: "/images/tuetanos-parrilla.png",
  },
  {
    nombre: "Queso Fundido Real",
    detalle: "Manchego + Oaxaca en cazuela; chistorra, champiñones o rajas.",
    precio: "$210",
    imagen: "/images/queso-fundido.png",
  },
  {
    nombre: "Sopes de Camarón al Ajillo",
    detalle: "Trío de sopes con frijol negro y camarón pacotilla.",
    precio: "$190",
    imagen: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1000&q=80",
  },
];

const sopas: Item[] = [
  {
    nombre: "Sopa de Tortilla Azteca",
    detalle: "Caldo de jitomate rostizado, julianas fritas, aguacate y queso panela.",
    precio: "$160",
    imagen: "/images/sopa-tortilla.png",
  },
  {
    nombre: "Ensalada César Original",
    detalle: "Lechuga orejona, aderezo artesanal, crotones y parmesano reggiano.",
    precio: "$220",
    imagen: "/images/ensalada-cesar.png",
  },
];

const fuertes: Item[] = [
  {
    nombre: "Chamorro de Cerdo Adobado",
    detalle: "Cocción lenta 8h, acompañado de arroz a la mexicana.",
    precio: "$480",
    imagen: "/images/chamorro-adobado.png",
  },
  {
    nombre: "Arrachera Angus Importada (350g)",
    detalle: "Marinada al carbón con nopal, chiles toreados y cebollitas.",
    precio: "$550",
    imagen: "/images/arrachera-angus.png",
  },
  {
    nombre: "Enchiladas de Mole Poblano",
    detalle: "Pollo orgánico, mole artesanal y ajonjolí tostado.",
    precio: "$320",
    imagen: "/images/enchiladas-mole.png",
  },
  {
    nombre: 'Molcajete Mixto "Volcán" (2 pax)',
    detalle: "Piedra caliente con salsa verde, res, pollo, chorizo, nopal y queso panela.",
    precio: "$850",
    imagen: "/images/molcajete-volcan.png",
  },
];

const postres: Item[] = [
  {
    nombre: "Flan Napolitano de la Abuela",
    detalle: "Caramelo quemado y frutos rojos.",
    precio: "$140",
    imagen: "/images/flan-napolitano.png",
  },
  {
    nombre: "Churros de Feria",
    detalle: "Recién hechos, con cajeta y chocolate.",
    precio: "$180",
    imagen: "/images/churros-feria.png",
  },
  {
    nombre: "Nieves Artesanales",
    detalle: "Sabores de temporada: mamey, cajeta y mezcal con cítricos.",
    precio: "$95",
    imagen: "/images/nieves.png",
  },
];

const bebidasSin: Item[] = [
  {
    nombre: "Aguas Frescas Gourmet (Jarra)",
    detalle: "Horchata con nuez, Jamaica con romero, Limón con chía. Jarra 1L.",
    precio: "$85 (1L)",
    sabores: ["Horchata", "Jamaica", "Limón con chía"],
  },
  {
    nombre: "Refrescos de Vidrio",
    detalle: "355 ml bien fríos. Perfectos con hielos y rodaja de limón.",
    precio: "$60 (355 ml)",
    sabores: ["Coca-Cola Original", "Coca-Cola Sin Azúcar", "Sidral", "Jarritos Tamarindo", "Jarritos Mandarina", "Jarritos Piña"],
  },
];

const cocteles: Item[] = [
  {
    nombre: "Cantarito de Lujo",
    detalle: "Tequila, jugos cítricos, sal de gusano en jarrito de barro. Vaso 400 ml aprox.",
    precio: "$190 (400 ml)",
    sabores: ["Naranja", "Toronja", "Limón"],
  },
  {
    nombre: "Mezcalita de Sabores",
    detalle: "Mezcal espadín joven con fruta fresca y escarchado de chile. Vaso 350 ml aprox.",
    precio: "$200 (350 ml)",
    sabores: ["Maracuyá", "Tamarindo", "Jamaica"],
  },
  {
    nombre: "Paloma Tradicional",
    detalle: "Tequila reposado, Squirt, limón y sal de grano. Vaso 400 ml aprox.",
    precio: "$180 (400 ml)",
    sabores: ["Clásica", "Con chile", "Light"],
  },
];

const cervezas: Item[] = [
  {
    nombre: "Nacionales",
    detalle: "355 ml bien frías. Corona, Victoria, Modelo Especial, Negra Modelo.",
    precio: "$70 (355 ml)",
    sabores: ["Corona", "Victoria", "Modelo Especial", "Negra Modelo"],
  },
  {
    nombre: "Michelada / Ojo Rojo",
    detalle: "1 litro con salsas negras, limón, clamato y escarchado con sal de mar.",
    precio: "$130 (1L)",
    sabores: ["Clásica", "Cubana", "Ojo Rojo"],
  },
];

const vipBotellas: Item[] = [
  { nombre: "Don Julio 70 (Cristalino)", precio: "$2,800", detalle: "Incluye 5 mezcladores." },
  { nombre: "Maestro Dobel Diamante", precio: "$2,400", detalle: "Incluye 5 mezcladores." },
  { nombre: "Herradura Reposado", precio: "$2,100", detalle: "Incluye 5 mezcladores." },
  { nombre: "Reserva de la Familia (Extra Añejo)", precio: "$4,500", detalle: "Incluye 5 mezcladores." },
  { nombre: "Clase Azul Reposado", precio: "$7,500", detalle: "Incluye 5 mezcladores." },
  { nombre: "400 Conejos Joven", precio: "$1,900", detalle: "Mezcal." },
  { nombre: "Montelobos Espadín", precio: "$2,200", detalle: "Mezcal." },
  { nombre: "Ojo de Tigre", precio: "$2,100", detalle: "Mezcal." },
  { nombre: "Buchanan’s 12 Años", precio: "$2,300", detalle: "Whisky." },
  { nombre: "Buchanan’s 18 Años", precio: "$3,900", detalle: "Whisky." },
  { nombre: "Johnnie Walker Black Label", precio: "$2,200", detalle: "Whisky." },
  { nombre: "Moët & Chandon", precio: "$3,500", detalle: "Champagne." },
];

const entretenimiento: Item[] = [
  {
    nombre: "Viernes – Acústico & Pop",
    detalle: "Solistas o dúos con guitarra, 9:00 pm - 11:30 pm. Ambiente para cena y charla. Cover general: $0.",
    precio: "Cover: $0",
  },
  {
    nombre: "Sábado – Norteño/Banda Light",
    detalle: "Grupos locales (3-4). Regional ligero para cantar. Horario 9:30 pm - 1:00 am. Área general sin cover.",
    precio: "Cover: $0",
  },
  {
    nombre: "Domingo – Voces y Baladas",
    detalle: "Clásicos de Juan Gabriel, José José, Luis Miguel. Ambiente familiar 7:00 pm - 10:00 pm.",
    precio: "Cover: $0",
  },
];

const promos: Item[] = [
  {
    nombre: "Cumpleañero VIP",
    detalle: "Zona VIP + compra de 2 botellas = vino espumoso de regalo, bengalas y mañanitas.",
    precio: "Desde $4,200 (2 botellas nacionales)",
  },
  {
    nombre: "Jueves de Pre-copa",
    detalle: "20% de descuento en botellas Tradicional, Etiqueta Roja, Smirnoff antes de las 10:00 pm.",
    precio: "Ej: Tradicional ~$1,120 con descuento",
  },
  {
    nombre: "Paquete Ejecutivo (Vie 2pm-6pm)",
    detalle: "1 botella nacional + 1kg carnitas/ arrachera al centro + guarniciones.",
    precio: "$2,500",
  },
];

function SectionGrid({ title, items }: { title: string; items: Item[] }) {
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

export default function MenuPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <header className="relative overflow-hidden bg-gradient-to-br from-amber-500/20 via-slate-900 to-slate-950">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center opacity-20" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-4 px-6 py-16">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-200">Menú de alimentos & mixología</p>
          <h1 className="text-4xl font-bold leading-tight text-white md:text-5xl">Sabores El Mirador</h1>
          <p className="max-w-3xl text-slate-200">
            Entradas para compartir, platos fuertes de autor, mixología y la exclusiva Zona VIP. Precios en MXN.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="/reservar"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-amber-300 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-500/40 ring-1 ring-amber-300/60 transition hover:shadow-xl hover:-translate-y-0.5"
            >
              Agendar ahora
            </a>
            <a
              href="/config/calendar"
              className="inline-flex items-center gap-2 rounded-full border border-amber-300/60 bg-slate-900/60 px-6 py-3 text-sm font-semibold text-amber-100 shadow-inner shadow-amber-500/10 transition hover:border-amber-200 hover:bg-slate-900/80"
            >
              Ver estado de Calendar
            </a>
          </div>
        </div>
      </header>

      <SectionGrid title="Entradas y Antojitos" items={entradas} />
      <SectionGrid title="Sopas y Ensaladas" items={sopas} />
      <SectionGrid title="Platos Fuertes" items={fuertes} />
      <SectionGrid title="Postres" items={postres} />

      <section className="mx-auto max-w-6xl px-6 py-10">
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
                <div key={b.nombre} className="flex items-start justify-between rounded-xl border border-white/15 bg-white/5 p-3">
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
    </main>
  );
}
