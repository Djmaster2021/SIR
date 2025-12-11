import { NextResponse } from "next/server";
import { apiUrl } from "@/lib/api";

export async function POST(request: Request) {
  const formData = await request.formData();

  const payload = {
    negocio: Number(formData.get("negocio")),
    servicio: Number(formData.get("servicio")),
    nombre: String(formData.get("nombre") || ""),
    email: String(formData.get("email") || ""),
    telefono: String(formData.get("telefono") || ""),
    fecha: String(formData.get("fecha") || ""),
    hora_inicio: String(formData.get("hora_inicio") || ""),
    hora_fin: String(formData.get("hora_fin") || ""),
    notas: String(formData.get("notas") || ""),
  };

  try {
    const res = await fetch(apiUrl("/api/public/citas/"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok) {
      const params = new URLSearchParams();
      params.set("success", "1");
      if (data?.cita_id) params.set("cita", String(data.cita_id));
      return NextResponse.redirect(new URL(`/reservar?${params.toString()}`, request.url));
    }

    const params = new URLSearchParams();
    params.set("error", "1");
    if (data?.errors) params.set("msg", "No pudimos agendar, revisa tu horario.");
    if (data?.sugerencia) params.set("sugerencia", JSON.stringify(data.sugerencia));
    if (payload.servicio) params.set("servicio", String(payload.servicio));
    if (payload.negocio) params.set("negocio", String(payload.negocio));

    return NextResponse.redirect(new URL(`/reservar?${params.toString()}`, request.url));
  } catch (err) {
    const params = new URLSearchParams();
    params.set("error", "1");
    params.set("msg", "No pudimos conectar con el servidor.");
    return NextResponse.redirect(new URL(`/reservar?${params.toString()}`, request.url));
  }
}
