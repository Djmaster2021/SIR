"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Lang, normalizeLang, withLangParam } from "@/lib/lang";

const copy: Record<
  Lang,
  {
    title: string;
    subtitle: string;
    reservar: string;
    citas: string;
  }
> = {
  es: {
    title: "SIR – Sistema Inteligente de Reservación",
    subtitle: "Panel de administración",
    reservar: "Reservar",
    citas: "Panel citas",
  },
  en: {
    title: "SIR – Smart Reservation System",
    subtitle: "Admin panel",
    reservar: "Book",
    citas: "Appointments",
  },
};

export function AppNavbar() {
  const searchParams = useSearchParams();
  const lang = normalizeLang(searchParams.get("lang"));
  const t = copy[lang];

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-slate-950 font-bold">
            S
          </span>
          <div>
            <p className="font-semibold leading-none">{t.title}</p>
            <p className="text-xs text-slate-400">{t.subtitle}</p>
          </div>
        </div>

        <nav className="flex items-center gap-4 text-sm text-slate-300">
          <Link href={withLangParam("/reservar", lang)} className="hover:text-emerald-400">
            {t.reservar}
          </Link>
          <Link href={withLangParam("/citas", lang)} className="hover:text-emerald-400">
            {t.citas}
          </Link>
        </nav>
      </div>
    </header>
  );
}
