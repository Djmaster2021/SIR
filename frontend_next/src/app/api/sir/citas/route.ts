// src/app/api/sir/citas/route.ts
import { NextResponse } from "next/server";
import { apiUrl } from "@/lib/api";

export async function POST(request: Request) {
  const formData = await request.formData();

  const payload = {
    negocio: Number(formData.get("negocio")),
    servicio: Number(formData.get("servicio")),
    cliente: Number(formData.get("cliente")),
    fecha: String(formData.get("fecha") || ""),
    hora_inicio: String(formData.get("hora_inicio") || ""),
    hora_fin: String(formData.get("hora_fin") || ""),
    estado: String(formData.get("estado") || "pendiente"),
    notas: String(formData.get("notas") || ""),
  };

  const res = await fetch(apiUrl("/api/citas/"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Error creando cita en Django:", res.status, text);
    return new NextResponse("Error creando cita", { status: 500 });
  }

  // Si todo bien, regresamos al listado de citas
  return NextResponse.redirect(new URL("/citas", request.url));
}
