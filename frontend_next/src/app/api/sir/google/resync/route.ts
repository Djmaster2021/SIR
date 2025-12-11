import { NextResponse } from "next/server";
import { apiUrl } from "@/lib/api";

export async function POST(request: Request) {
  const formData = await request.formData();
  const limitStr = String(formData.get("limit") || "200");
  const limit = Number(limitStr) || 200;

  const res = await fetch(apiUrl("/api/google/resync/"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ limit }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Error ejecutando resync:", res.status, text);
    return new NextResponse("Error ejecutando resync", { status: 500 });
  }

  return NextResponse.redirect(new URL("/config/calendar", request.url));
}
