// src/app/api/sir/citas/[id]/update/route.ts
import { NextResponse } from "next/server";
import { apiUrl } from "@/lib/api";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const formData = await request.formData();

  const payload: Record<string, any> = {
    estado: String(formData.get("estado") || ""),
    notas: String(formData.get("notas") || ""),
  };

  const res = await fetch(apiUrl(`/api/citas/${params.id}/`), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Error actualizando cita:", params.id, res.status, text);
    return new NextResponse("Error actualizando cita", { status: 500 });
  }

  return NextResponse.redirect(new URL("/citas", request.url));
}
