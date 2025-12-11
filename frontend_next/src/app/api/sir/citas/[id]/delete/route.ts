// Elimina una cita en el backend Django
import { NextResponse } from "next/server";
import { apiUrl } from "@/lib/api";

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const res = await fetch(apiUrl(`/api/citas/${params.id}/`), {
    method: "DELETE",
  });

  if (!res.ok && res.status !== 204) {
    const text = await res.text();
    console.error("Error eliminando cita", params.id, res.status, text);
    return new NextResponse("Error eliminando cita", { status: 500 });
  }

  return NextResponse.redirect(new URL("/citas", request.url));
}
