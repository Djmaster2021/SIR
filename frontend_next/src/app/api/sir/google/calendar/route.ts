import { NextResponse } from "next/server";
import { apiUrl } from "@/lib/api";

export async function POST(request: Request) {
  const formData = await request.formData();
  const calendarId = String(formData.get("calendar_id") || "");
  const doResync = Boolean(formData.get("resync"));

  const res = await fetch(apiUrl("/api/google/calendar/"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ calendar_id: calendarId, resync: doResync }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Error actualizando Calendar:", res.status, text);
    return new NextResponse("Error actualizando Calendar", { status: 500 });
  }

  return NextResponse.redirect(new URL("/config/calendar", request.url));
}
