import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SIR – Sistema Inteligente de Reservación",
  description: "Panel de administración de SIR",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-slate-950 text-slate-100">
        {/* Navbar principal */}
        <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-slate-950 font-bold">
                S
              </span>
              <div>
                <p className="font-semibold leading-none">
                  SIR – Sistema Inteligente de Reservación
                </p>
                <p className="text-xs text-slate-400">
                  Panel de administración
                </p>
              </div>
            </div>

            <nav className="flex items-center gap-4 text-sm text-slate-300">
              <a href="/" className="hover:text-emerald-400">
                Negocios
              </a>
              {/* Más adelante agregamos estas rutas */}
              {/* <a href="/servicios" className="hover:text-emerald-400">Servicios</a>
              <a href="/clientes" className="hover:text-emerald-400">Clientes</a>
              <a href="/citas" className="hover:text-emerald-400">Citas</a> */}
            </nav>
          </div>
        </header>

        {/* Contenido */}
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
