// src/app/page.tsx
"use client";

import Image from "next/image";
import { useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lang, normalizeLang, withLangParam } from "@/lib/lang";
import {
  bebidasSin,
  cervezas,
  cocteles,
  destacados,
  entretenimiento,
  entradas,
  especialesSemana,
  fuertes,
  promos,
  sopas,
} from "@/lib/menu-data";

type SectionProps = {
  titulo: string;
  id?: string;
  lang: Lang;
  ctaLabel?: string;
  variant?: "light" | "dark";
  items: {
    titulo: string;
    descripcion: string;
    precio?: string;
    imagen?: string;
  }[];
};

const testimonials = [
  {
    nombre: "Lucía R.",
    comentario: "Reservé en dos minutos y al llegar ya estaba mi mesa lista. La arrachera al carbón es increíble.",
  },
  {
    nombre: "Andrés M.",
    comentario: "El sistema de citas evita filas. Gran mixología y servicio cálido.",
  },
  {
    nombre: "Sofía T.",
    comentario: "Ambiente ligero, música en vivo sin ser invasiva y postres buenísimos.",
  },
];

function SectionGrid({ titulo, items, id, lang, ctaLabel, variant = "dark" }: SectionProps) {
  const isLight = variant === "light";
  return (
    <section
      id={id}
      className={`py-12 sm:py-14 lg:py-16 ${isLight ? "bg-white text-slate-900" : "bg-transparent text-white"}`}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p
              className={`text-xs uppercase tracking-[0.3em] ${isLight ? "text-amber-600" : "text-amber-200"}`}
            >
              {lang === "es" ? "Selección" : "Selection"}
            </p>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold">{titulo}</h2>
          </div>
          {ctaLabel && (
            <a
              href={withLangParam("/reservar", lang)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm sm:px-5 sm:py-2.5 sm:text-base font-semibold ${
                isLight
                  ? "border-slate-200 text-slate-900 hover:border-amber-400"
                  : "border-white/20 bg-white/5 text-amber-100 shadow-sm transition hover:border-amber-200"
              }`}
            >
              {ctaLabel}
            </a>
          )}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <div
              key={item.titulo}
              className={`flex items-start justify-between gap-3 rounded-2xl border px-3 sm:px-4 py-3 ${
                isLight
                  ? "border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  : "border-white/10 bg-white/5 shadow-inner shadow-black/10"
              }`}
            >
              {item.imagen && (
                <div
                  className={`relative h-12 w-12 sm:h-14 sm:w-14 overflow-hidden rounded-full border ${
                    isLight ? "border-slate-200 bg-slate-50" : "border-white/10 bg-slate-900/60"
                  }`}
                >
                  <Image
                    src={item.imagen}
                    alt={item.titulo}
                    fill
                    className="object-cover"
                    sizes="60px"
                    priority={id === "menu"}
                  />
                </div>
              )}
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-base sm:text-lg font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>
                    {item.titulo}
                  </p>
                  {item.precio && (
                    <span className={`text-sm sm:text-base ${isLight ? "text-amber-600" : "text-amber-200"}`}>
                      {item.precio}
                    </span>
                  )}
                </div>
                <p className={`text-sm sm:text-base ${isLight ? "text-slate-600" : "text-slate-300"}`}>
                  {item.descripcion}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [lang, setLang] = useState<Lang>(() => normalizeLang(searchParams.get("lang")));

  useEffect(() => {
    setLang(normalizeLang(searchParams.get("lang")));
  }, [searchParams]);

  const handleLangChange = (value: Lang) => {
    setLang(value);
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set("lang", value);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const t = useMemo(
    () => ({
      es: {
        nav: [
          { href: "#home", label: "Home" },
          { href: "#nosotros", label: "Nosotros" },
          { href: "#menu", label: "Menú" },
          { href: "#eventos", label: "Eventos" },
          { href: "#contacto", label: "Contacto" },
          { href: "/reservar", label: "Reservas" },
        ],
        cuisine: "Cocina Mexicana",
        title: "RESTAURANTE EL MIRADOR",
        heroKicker: "Sabores al carbón · Mixología",
        heroText:
          "Disfruta sabores caseros, cortes al carbón y mixología de la casa en un ambiente cálido. Reserva tu mesa en segundos y recibe confirmación y recordatorios automáticos.",
        heroSub: "Cocina de origen, técnicas al carbón y un servicio pensado para evitar filas y llamadas.",
        ctaBook: "Reservar",
        ctaPanel: "Panel citas",
        ctaMenu: "Ver menú",
        ctaMenuPdf: "Menú completo",
        sectionMenu: "Entradas y Antojitos",
        sectionFuertes: "Platos fuertes",
        sectionEspeciales: "Especialidades del menú",
        sectionPromos: "Promociones del día",
        sectionPostres: "Postres",
        sectionBebidas: "Aguas frescas, coctelería y cervezas",
        sectionKit: "Kit de cumpleaños",
        sectionActividades: "Música y ambiente",
        sectionNosotros: "Desde 2004 sirviendo sabores mexicanos",
        aboutTitle: "Sala, barra y terraza con alma tapatía.",
        contactSubtitle:
          "Tradición familiar, ingredientes frescos y ahora un sistema de citas inteligente que sincroniza tu reservación en Google Calendar. Sin llamadas, sin esperas.",
        menuLead: "Carta curada, minimalista y con precios claros.",
        menuBarTitle: "Bar y bebidas",
        locationLine: "Av. Central 102 · Guadalajara",
        hoursLine: "Lun - Dom · 13:00 a 23:00",
        historyTitle: "Nuestra historia",
        historyBody:
          "Nacimos en 2004 como un comedor familiar. Hoy somos sala, barra y terraza con cocina de origen, brasa y mixología de autor.",
        historyCta: "Conócenos",
        bookTitle: "Reserva tu mesa",
        bookHours: "Horario 13:00 - 23:00 · Lunes a Domingo",
        bookNote: "Confirmación automática por correo y recordatorios sin llamadas.",
        logoLine: "Cocina, barra y terraza · Guadalajara",
        menuMore: "Ver menú completo",
        contactTitle: "Horarios y contacto",
        contactCta: "Contáctanos",
        testimonialsTitle: "Opiniones recientes",
        eventsTitle: "Eventos y experiencias",
        footerPolicy: "Política de privacidad",
      },
      en: {
        nav: [
          { href: "#home", label: "Home" },
          { href: "#nosotros", label: "About" },
          { href: "#menu", label: "Menu" },
          { href: "#eventos", label: "Events" },
          { href: "#contacto", label: "Contact" },
          { href: "/reservar", label: "Bookings" },
        ],
        cuisine: "Mexican Cuisine",
        title: "EL MIRADOR RESTAURANT",
        heroKicker: "Fire-grilled flavor · House mixology",
        heroText:
          "Enjoy homestyle flavors, grilled cuts and house mixology in a warm atmosphere. Book your table in seconds and get confirmations and reminders automatically.",
        heroSub: "Origin cuisine, live fire techniques, and service designed to avoid lines and phone calls.",
        ctaBook: "Book now",
        ctaPanel: "Bookings",
        ctaMenu: "View menu",
        ctaMenuPdf: "Full menu",
        sectionMenu: "Starters & Bites",
        sectionFuertes: "Mains",
        sectionEspeciales: "Chef's Specials",
        sectionPromos: "Today's deals",
        sectionPostres: "Desserts",
        sectionBebidas: "Fresh waters, cocktails & beers",
        sectionKit: "Birthday kit",
        sectionActividades: "Music & ambience",
        sectionNosotros: "Since 2004 serving Mexican flavor",
        aboutTitle: "Dining room, bar, and terrace with a Tapatío soul.",
        contactSubtitle:
          "Family tradition, fresh ingredients and an intelligent booking system that syncs with Google Calendar. No calls, no waiting.",
        menuLead: "Curated, minimalist menu with transparent pricing.",
        menuBarTitle: "Bar & drinks",
        locationLine: "Av. Central 102 · Guadalajara",
        hoursLine: "Mon - Sun · 1 pm to 11 pm",
        historyTitle: "Our story",
        historyBody:
          "Born in 2004 as a family dining room. Now a dining room, bar, and terrace with origin cooking, fire-grill, and signature mixology.",
        historyCta: "Learn more",
        bookTitle: "Book your table",
        bookHours: "Hours 1:00 pm - 11:00 pm · Monday to Sunday",
        bookNote: "Automatic email confirmations and reminders—no calls.",
        logoLine: "Kitchen, bar and terrace · Guadalajara",
        menuMore: "View full menu",
        contactTitle: "Hours & contact",
        contactCta: "Contact us",
        testimonialsTitle: "Recent reviews",
        eventsTitle: "Events & experiences",
        footerPolicy: "Privacy policy",
      },
    }),
    [],
  )[lang];

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(251,191,36,0.08),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(56,189,248,0.08),transparent_25%),radial-gradient(circle_at_50%_80%,rgba(34,197,94,0.08),transparent_30%)] pan-slow" />
      <section id="home" className="relative overflow-hidden px-3 sm:px-4 py-10 sm:py-12 lg:py-16">
        <div className="mx-auto max-w-6xl rounded-[32px] border border-white/5 bg-slate-950/70 shadow-2xl shadow-black/50">
          <div className="relative overflow-hidden rounded-[32px] min-h-[80vh] lg:min-h-[90vh]">
            <div className="absolute inset-0">
              <Image
                src="/hero-platillos.jpg"
                alt="Platillos destacados de El Mirador"
                fill
                className="h-full w-full object-cover opacity-60"
                priority
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-slate-950/75 via-slate-950/55 to-slate-950/80" />
            </div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(247,186,105,0.08),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(99,102,241,0.08),transparent_35%)]" />
            <div className="absolute inset-x-10 top-8 rounded-3xl border border-amber-300/15 bg-white/5 blur-3xl" />

            <div className="relative flex flex-col gap-10 px-5 sm:px-8 py-12 lg:flex-row lg:items-center">
              <div className="space-y-6 lg:w-3/5">
                <nav className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-300">
                  <span className="mr-2 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-[13px] font-semibold text-white">
                    <Image src="/logo.webp" alt="Logo" width={18} height={18} className="rounded-full bg-white/70 p-0.5" />
                    El Mirador
                  </span>
                  {t.nav.map((item) => (
                    <a
                      key={item.href}
                      href={item.href.startsWith("/") ? withLangParam(item.href, lang) : item.href}
                      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[13px] font-medium text-slate-200 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] transition hover:-translate-y-0.5 hover:border-amber-300/60 hover:text-amber-100"
                    >
                      {item.label}
                    </a>
                  ))}
                  <button
                    onClick={() => handleLangChange("es")}
                    className={`rounded-full border px-3 py-1.5 text-[13px] font-semibold tracking-wide transition ${
                      lang === "es"
                        ? "border-amber-300/80 bg-amber-300/10 text-amber-100 shadow-[0_0_0_1px_rgba(251,191,36,0.25)]"
                        : "border-white/15 bg-white/5 text-slate-300 hover:border-amber-300/50 hover:text-amber-100"
                    }`}
                  >
                    ES
                  </button>
                  <button
                    onClick={() => handleLangChange("en")}
                    className={`rounded-full border px-3 py-1.5 text-[13px] font-semibold tracking-wide transition ${
                      lang === "en"
                        ? "border-amber-300/80 bg-amber-300/10 text-amber-100 shadow-[0_0_0_1px_rgba(251,191,36,0.25)]"
                        : "border-white/15 bg-white/5 text-slate-300 hover:border-amber-300/50 hover:text-amber-100"
                    }`}
                  >
                    EN
                  </button>
                </nav>
                <div className="flex items-center gap-3 text-xs sm:text-sm uppercase tracking-[0.3em] text-amber-200">
                  <span className="inline-flex h-2 w-2 rounded-full bg-emerald-300" />
                  {t.heroKicker}
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight">
                  {t.title}
                </h1>
                <p className="text-sm sm:text-base text-slate-200">
                  {t.heroText}
                </p>
                <p className="text-sm sm:text-base text-slate-400">{t.heroSub}</p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href={withLangParam("/reservar", lang)}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-5 sm:px-6 py-3 text-sm sm:text-base font-semibold text-slate-950 shadow-lg shadow-amber-500/30 transition hover:-translate-y-0.5"
                  >
                    {t.ctaBook}
                  </a>
                  <a
                    href="#menu"
                    className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/5 px-5 sm:px-6 py-3 text-sm sm:text-base font-semibold text-white shadow-inner shadow-white/5 transition hover:border-amber-200 hover:text-amber-100"
                  >
                    {t.ctaMenu}
                  </a>
                  <a
                    href="/menu.pdf"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 sm:px-6 py-3 text-sm sm:text-base font-semibold text-slate-100 transition hover:border-amber-200"
                  >
                    {t.ctaMenuPdf}
                  </a>
                  <a
                    href={withLangParam("/citas", lang)}
                    className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-5 sm:px-6 py-3 text-sm sm:text-base font-semibold text-amber-100 shadow-inner shadow-amber-500/10 transition hover:border-amber-200"
                  >
                    {t.ctaPanel}
                  </a>
                </div>
                <div className="flex flex-wrap gap-3 text-xs sm:text-sm text-slate-300">
                  <span className="rounded-full border border-white/15 px-3 py-1">{t.locationLine}</span>
                  <span className="rounded-full border border-white/15 px-3 py-1">{t.hoursLine}</span>
                </div>
              </div>

              <div className="relative mx-auto flex w-full max-w-xl items-center justify-center lg:w-2/5">
                <div className="absolute -left-10 -top-8 h-20 w-20 rounded-full bg-amber-400/20 blur-2xl" />
                <div className="absolute -right-8 top-0 h-16 w-16 rounded-full bg-emerald-400/15 blur-2xl" />
                <div className="relative h-64 w-64 sm:h-80 sm:w-80 lg:h-96 lg:w-96 rounded-full border border-amber-200/30 bg-white/5 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.7)] float-soft">
                  <Image
                    src="/logo.webp"
                    alt="Logo El Mirador"
                    fill
                    className="rounded-full object-contain p-10"
                    sizes="360px"
                    priority
                  />
                  <div className="absolute inset-0 rounded-full border border-white/5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección estilo “Our Story” */}
      <section id="historia" className="bg-white text-slate-900">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:gap-12 px-4 sm:px-6 py-12 sm:py-16 md:flex-row md:items-center">
          <div className="flex-1 space-y-4">
            <p className="text-xs uppercase tracking-[0.25em] text-amber-600">{t.historyTitle}</p>
            <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900">{t.aboutTitle}</h2>
            <p className="text-slate-700 text-base sm:text-lg">{t.historyBody}</p>
            <div className="flex flex-wrap gap-3 text-sm sm:text-base text-slate-700">
              <span className="rounded-full border border-slate-200 px-3 py-1">{t.locationLine}</span>
              <span className="rounded-full border border-slate-200 px-3 py-1">{t.hoursLine}</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 shadow-lg aspect-[4/3]">
              <Image
                src="/images/guacamole-patron.png"
                alt="Guacamole El Patrón"
                fill
                className="h-full w-full object-cover"
                sizes="(min-width: 1024px) 600px, 100vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Sección especialidades */}
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0">
          <Image
            src="/hero-platillos.jpg"
            alt="Cocina y barra El Mirador"
            fill
            className="object-cover opacity-40"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/75 to-slate-950/90" />
        </div>
        <div className="relative mx-auto flex max-w-6xl flex-col-reverse gap-8 lg:gap-12 px-4 sm:px-6 py-12 sm:py-16 md:flex-row md:items-center">
          <div className="flex-1 space-y-4">
            <p className="text-xs uppercase tracking-[0.25em] text-amber-300">Brasa & Barra</p>
            <h2 className="text-2xl sm:text-3xl font-semibold">{t.sectionEspeciales}</h2>
            <p className="text-slate-200 text-base sm:text-lg">{t.historyBody}</p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#menu"
                className="rounded-full border border-white/25 px-4 sm:px-5 py-2 text-sm sm:text-base font-semibold text-white hover:border-amber-200"
              >
                {t.ctaMenu}
              </a>
              <a
                href={withLangParam("/reservar", lang)}
                className="rounded-full bg-white px-4 sm:px-5 py-2 text-sm sm:text-base font-semibold text-slate-900 shadow"
              >
                {t.ctaBook}
              </a>
            </div>
          </div>
          <div className="flex-1">
            <div className="relative h-64 sm:h-72 overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
              <Image
                src="/images/molcajete-volcan.png"
                alt="Molcajete Volcán"
                fill
                className="object-cover"
                sizes="600px"
              />
            </div>
          </div>
        </div>
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 pb-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {destacados.map((item) => (
              <div
                key={item.titulo}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-3 shadow-inner shadow-black/20"
              >
                <div className="relative h-32 w-full overflow-hidden rounded-xl">
                  <Image
                    src={item.imagen}
                    alt={item.titulo}
                    fill
                    className="object-cover transition duration-700 group-hover:scale-105"
                    sizes="(min-width: 1024px) 240px, 90vw"
                  />
                </div>
                <div className="space-y-1 p-2">
                  <p className="text-base font-semibold">{item.titulo}</p>
                  <p className="text-sm text-slate-200">{item.descripcion}</p>
                  <p className="text-sm font-semibold text-amber-200">{item.precio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sección menú en tarjetas */}
      <section id="menu-resumen" className="bg-white text-slate-900">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 sm:px-6 py-12 sm:py-16">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-amber-600">{t.sectionMenu}</p>
              <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900">{t.menuLead}</h2>
            </div>
            <a
              href="/menu.pdf"
              className="rounded-full border border-slate-200 px-4 py-2 text-sm sm:text-base font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:border-amber-400"
            >
              {t.menuMore}
            </a>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { img: "/images/arrachera-angus.png", title: "Arrachera Angus" },
              { img: "/images/cantarito-lujo.png", title: "Cantarito de lujo" },
              { img: "/images/tuetanos-parrilla.png", title: "Tuétanos al carbón" },
              { img: "/images/queso-fundido.png", title: "Queso fundido real" },
            ].map((card) => (
              <div
                key={card.title}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <Image
                  src={card.img}
                  alt={card.title}
                  width={400}
                  height={260}
                  className="h-44 w-full object-cover"
                />
                <div className="p-3 text-center text-sm sm:text-base font-semibold text-slate-800">{card.title}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SectionGrid
        id="menu"
        lang={lang}
        ctaLabel={lang === "es" ? "Agendar ahora →" : "Book now →"}
        variant="light"
        titulo={t.sectionMenu}
        items={entradas.map((item) => ({
          titulo: item.nombre,
          descripcion: item.detalle,
          precio: item.precio,
          imagen: item.imagen,
        }))}
      />

      <SectionGrid
        id="sopas"
        lang={lang}
        variant="light"
        titulo={lang === "es" ? "Sopas y ensaladas" : "Soups & greens"}
        items={sopas.map((item) => ({
          titulo: item.nombre,
          descripcion: item.detalle,
          precio: item.precio,
          imagen: item.imagen,
        }))}
      />

      <SectionGrid
        id="fuertes"
        lang={lang}
        variant="light"
        titulo={t.sectionFuertes}
        items={fuertes.map((item) => ({
          titulo: item.nombre,
          descripcion: item.detalle,
          precio: item.precio,
          imagen: item.imagen,
        }))}
      />

      <section id="promos" className="py-10">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-slate-900 via-slate-900/70 to-slate-900 px-4 sm:px-6 py-6 sm:py-8 shadow-lg shadow-black/30">
          <div className="grid gap-4 md:grid-cols-[1.1fr,0.9fr,0.9fr] md:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-amber-200">{t.sectionPromos}</p>
              <h2 className="text-2xl font-semibold text-white">
                {lang === "es" ? "Especiales de la semana" : "Weekly highlights"}
              </h2>
              <p className="text-sm text-slate-400">
                {lang === "es" ? "Disponibles en sala y terraza." : "Available in dining room and terrace."}
              </p>
            </div>
            {especialesSemana.slice(0, 2).map((esp) => (
              <div key={esp.titulo} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-sm font-semibold text-amber-200">{esp.titulo}</p>
                <p className="text-sm text-slate-200">{esp.detalle}</p>
                <p className="text-sm font-semibold text-white">{esp.precio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="bebidas" className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-14 bg-white text-slate-900">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-amber-600">{lang === "es" ? "Bebidas" : "Drinks"}</p>
            <h2 className="text-2xl font-semibold text-slate-900">{t.sectionBebidas}</h2>
            <p className="text-slate-600">
              {lang === "es"
                ? "Opciones sin alcohol, cocteles de la casa y cervezas bien frías."
                : "Zero-proof options, house cocktails, and ice-cold beers."}
            </p>
          </div>
          <a
            href={withLangParam("/reservar", lang)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow hover:-translate-y-0.5"
          >
            {t.ctaBook}
          </a>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-amber-700">
              {lang === "es" ? "Sin alcohol" : "Zero-proof"}
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {bebidasSin.map((b) => (
                <li key={b.nombre} className="border-b border-slate-100 pb-2 last:border-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold">{b.nombre}</span>
                    <span className="text-amber-700">{b.precio}</span>
                  </div>
                  <p className="text-slate-500">{b.detalle}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-amber-700">
              {lang === "es" ? "Coctelería" : "Cocktails"}
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {cocteles.map((c) => (
                <li key={c.nombre} className="border-b border-slate-100 pb-2 last:border-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold">{c.nombre}</span>
                    <span className="text-amber-700">{c.precio}</span>
                  </div>
                  <p className="text-slate-500">{c.detalle}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-amber-700">
              {lang === "es" ? "Cervezas" : "Beers"}
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {cervezas.map((c) => (
                <li key={c.nombre} className="border-b border-slate-100 pb-2 last:border-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold">{c.nombre}</span>
                    <span className="text-amber-700">{c.precio}</span>
                  </div>
                  <p className="text-slate-500">{c.detalle}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-slate-950 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-14">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 shadow-inner shadow-black/20">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-200">{t.testimonialsTitle}</p>
            <h2 className="mt-1 text-3xl font-semibold text-white">{lang === "es" ? "Lo que dicen" : "What guests say"}</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {testimonials.map((tst) => (
                <div key={tst.nombre} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-200 shadow">
                  <p className="text-slate-100">“{tst.comentario}”</p>
                  <p className="mt-2 text-xs uppercase tracking-wide text-amber-200">{tst.nombre}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="eventos" className="bg-white text-slate-900">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-14">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-amber-200/60 bg-amber-50 p-6 shadow-lg shadow-amber-500/10">
              <p className="text-xs uppercase tracking-[0.3em] text-amber-600">
                {lang === "es" ? "Kit de cumpleaños" : "Birthday kit"}
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-900">
                {lang === "es" ? "Celebración VIP para cumpleañeros" : "VIP birthday celebration"}
              </h3>
              <p className="mt-2 text-slate-700">
                {lang === "es"
                  ? "Zona VIP, bengalas, mañanitas y vino espumoso de cortesía al comprar 2 botellas nacionales."
                  : "VIP area, sparklers, birthday song and complimentary sparkling wine with 2 national bottles."}
              </p>
              <ul className="mt-3 space-y-2 text-sm text-slate-800">
                <li>{lang === "es" ? "✓ Mesa preferencial en área VIP" : "✓ Preferred VIP table"}</li>
                <li>{lang === "es" ? "✓ Decoración, bengalas y brindis" : "✓ Decor, sparklers and toast"}</li>
                <li>{lang === "es" ? "✓ Botana seca gourmet incluida" : "✓ Gourmet snacks included"}</li>
              </ul>
              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href={withLangParam("/reservar", lang)}
                  className="rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-500/30 hover:bg-emerald-400"
                >
                  {lang === "es" ? "Reservar kit" : "Book kit"}
                </a>
                {promos[0] && <span className="text-sm font-semibold text-amber-700">{promos[0].precio}</span>}
              </div>
            </div>
            <div
              id="actividades"
              className="rounded-2xl border border-emerald-200/60 bg-emerald-50 p-6 shadow-lg shadow-emerald-900/10"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">{t.sectionActividades}</p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-900">
                {lang === "es" ? "Música y ambiente" : "Live music & vibe"}
              </h3>
              <ul className="mt-3 space-y-3 text-sm text-emerald-900">
                {entretenimiento.map((e) => (
                  <li key={e.nombre} className="rounded-xl border border-emerald-100 bg-white p-3 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{e.nombre}</p>
                        <p className="text-emerald-800/80">{e.detalle}</p>
                      </div>
                      {e.precio && <span className="text-emerald-700">{e.precio}</span>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="nosotros" className="bg-slate-950 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-14">
          <div className="grid gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 shadow-inner shadow-black/20 md:grid-cols-[1.2fr,0.8fr]">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-amber-200">{t.contactTitle}</p>
              <h2 className="text-3xl font-semibold">{t.sectionNosotros}</h2>
              <p className="text-slate-300">{t.contactSubtitle}</p>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>{lang === "es" ? "✓ Disponibilidad en tiempo real por mesa" : "✓ Real-time availability by table"}</li>
                <li>{lang === "es" ? "✓ Confirmaciones y recordatorios automáticos" : "✓ Automatic confirmations and reminders"}</li>
                <li>{lang === "es" ? "✓ Recomendaciones de horario para evitar filas" : "✓ Time suggestions to avoid lines"}</li>
              </ul>
              <div className="flex flex-wrap gap-3 text-sm text-slate-200">
                <span className="rounded-full border border-white/20 px-3 py-1">{lang === "es" ? "Tel" : "Phone"}: +52 (33) 2233 2211</span>
                <span className="rounded-full border border-white/20 px-3 py-1">Email: contacto@elmirador.mx</span>
                <span className="rounded-full border border-white/20 px-3 py-1">WhatsApp: +52 33 0000 0000</span>
              </div>
              <div className="flex gap-3">
                <a
                  href={withLangParam("/reservar", lang)}
                  className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 shadow hover:-translate-y-0.5"
                >
                  {t.ctaBook}
                </a>
                <a
                  href="#contacto"
                  className="rounded-full border border-white/25 px-5 py-2.5 text-sm font-semibold text-white hover:border-amber-200"
                >
                  {t.contactCta}
                </a>
              </div>
            </div>
            <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-950/60 p-5">
              <p className="text-sm font-semibold text-amber-200">{lang === "es" ? "Horarios" : "Hours"}</p>
              <p className="text-sm text-slate-200">{t.hoursLine}</p>
              <p className="text-sm text-slate-200">{t.locationLine}</p>
              <p className="text-xs text-slate-400">
                {lang === "es" ? "Reservas en línea 24/7 · Confirmación inmediata." : "Online bookings 24/7 · Instant confirmation."}
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer id="contacto" className="bg-white text-slate-900">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-3">
              <Image src="/logo.webp" alt="El Mirador" width={60} height={60} className="rounded-lg border border-slate-200 bg-white p-2 shadow-sm" />
              <div>
                <h3 className="text-lg font-semibold">El Mirador</h3>
                <p className="text-xs text-slate-600">{t.locationLine}</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-700">
              {lang === "es"
                ? "Cocina mexicana auténtica con servicio cálido y reservas inteligentes en un solo clic."
                : "Authentic Mexican cuisine with warm service and smart bookings in one click."}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-800">{lang === "es" ? "Horarios" : "Hours"}</h4>
            <ul className="text-sm text-slate-700">
              <li>{lang === "es" ? "Lunes a Domingo: 13:00 – 23:00" : "Mon to Sun: 1 pm – 11 pm"}</li>
              <li>{lang === "es" ? "Reservas en línea 24/7" : "Online bookings 24/7"}</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-800">{lang === "es" ? "Contacto" : "Contact"}</h4>
            <ul className="text-sm text-slate-700">
              <li>Av. Central 102, Guadalajara</li>
              <li>{lang === "es" ? "Tel: (33) 2233 2211" : "Phone: +52 (33) 2233 2211"}</li>
              <li>{lang === "es" ? "Correo: contacto@elmirador.mx" : "Email: contacto@elmirador.mx"}</li>
            </ul>
            <div className="mt-3 flex gap-3 text-sm font-semibold text-slate-800">
              <a href={withLangParam("/reservar", lang)} className="underline decoration-slate-500 underline-offset-4">
                {lang === "es" ? "Agendar" : "Book"}
              </a>
              <a href={withLangParam("/citas", lang)} className="underline decoration-slate-500 underline-offset-4">
                {lang === "es" ? "Panel" : "Dashboard"}
              </a>
            </div>
            <div className="mt-3 flex items-center gap-3 text-sm text-slate-700">
              <a
                href="https://facebook.com"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 p-2 shadow-sm transition hover:-translate-y-0.5"
                aria-label="Facebook"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-slate-700">
                  <path d="M13.4 20.5v-6h2.1l.3-2.3h-2.4v-1.5c0-.7.2-1.2 1.2-1.2h1.3V7.1c-.6-.1-1.4-.2-2.2-.2-2.2 0-3.7 1.3-3.7 3.8v1.7H8.1v2.3h1.9v6h3.4Z" />
                </svg>
              </a>
              <a
                href="https://instagram.com"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 p-2 shadow-sm transition hover:-translate-y-0.5"
                aria-label="Instagram"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-slate-700">
                  <rect x="3.5" y="3.5" width="17" height="17" rx="4" stroke="currentColor" strokeWidth="1.6" />
                  <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
                  <circle cx="17" cy="7" r="1.2" fill="currentColor" />
                </svg>
              </a>
              <a href="#" className="underline decoration-slate-500 underline-offset-4">
                {t.footerPolicy}
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-200 bg-slate-50">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3 text-xs font-semibold text-slate-700">
            <span>© El Mirador · Todos los derechos reservados</span>
            <a href={withLangParam("/reservar", lang)} className="underline decoration-slate-500 underline-offset-4">
              {lang === "es" ? "Reservar" : "Book"}
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
