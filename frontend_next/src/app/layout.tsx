import type { Metadata } from "next";
import "./globals.css";
import { AppNavbar } from "./app-navbar";

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
        <AppNavbar />

        {/* Contenido: cada página define su propio ancho y espaciado */}
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
