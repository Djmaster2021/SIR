import Image from "next/image";
import Link from "next/link";
import { fullMenu } from "@/lib/full-menu-data";

const heroShots = ["/hero-pdf.jpg", "/hero-platillos.jpg"];

export default function MenuCompletoPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-amber-50">
      <div className="relative overflow-hidden border-b border-white/10 bg-slate-950">
        <div className="absolute inset-0">
          <Image
            src={heroShots[0]}
            alt="Platillos El Mirador"
            fill
            priority
            className="h-full w-full object-cover opacity-35"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950/85 to-slate-900/90" />
        </div>
        <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:px-6 py-12 sm:py-16">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-[0.35em] text-amber-200">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">El Mirador</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Cocina Mexicana Contemporanea</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Restaurante 5 Estrellas</span>
          </div>
          <div className="grid gap-6 md:grid-cols-[1.1fr,0.9fr] md:items-center">
            <div className="space-y-4">
              <p className="text-sm font-semibold text-amber-200">Menu completo</p>
              <h1 className="text-3xl sm:text-4xl font-semibold leading-tight">Carta El Mirador</h1>
              <p className="text-slate-200 text-base sm:text-lg">
                Entradas signature, pastas mexicanas de autor, platos fuertes al carbon y mixologia de la casa.
                Elige tus favoritos y compartelos en sala o terraza.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/#menu"
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-amber-100 hover:border-amber-200"
                >
                  Volver al inicio
                </Link>
                <Link
                  href="/reservar"
                  className="inline-flex items-center gap-2 rounded-full bg-amber-300 px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-amber-500/30 hover:-translate-y-0.5"
                >
                  Reservar mesa
                </Link>
                <a
                  href="/menu-static.pdf"
                  download
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-4 py-2 text-sm font-semibold text-amber-100 hover:border-amber-200"
                >
                  Descargar PDF
                </a>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 rounded-3xl border border-white/10 bg-white/5 p-3 shadow-inner shadow-black/40">
              {heroShots.map((shot) => (
                <div
                  key={shot}
                  className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 bg-white/5"
                >
                  <Image
                    src={shot}
                    alt="Vista del menu"
                    fill
                    className="h-full w-full object-cover"
                    sizes="(min-width: 768px) 300px, 45vw"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-8 px-4 sm:px-6 py-12 sm:py-16">
        {fullMenu.map((section) => (
          <section
            key={section.titulo}
            className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-7 shadow-inner shadow-black/30"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-amber-300">El Mirador</p>
                <h2 className="text-2xl font-semibold text-white">{section.titulo}</h2>
                {section.descripcion && <p className="text-sm text-slate-200">{section.descripcion}</p>}
              </div>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {section.items.map((item) => (
                <div
                  key={item.nombre}
                  className="flex gap-3 rounded-2xl border border-white/10 bg-slate-950/60 p-4 shadow-sm shadow-black/20"
                >
                  {item.imagen && (
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                      <Image
                        src={item.imagen}
                        alt={item.nombre}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                  )}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-base sm:text-lg font-semibold text-white">{item.nombre}</p>
                      {item.precio && <span className="text-sm font-semibold text-amber-200">{item.precio}</span>}
                    </div>
                    {item.detalle && item.detalle.trim().length > 0 && (
                      <p className="text-sm text-slate-200">{item.detalle}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
