"use client";

import Link from "next/link";
import { useState } from "react";
import { apiUrl } from "@/lib/api";
import { withLangParam } from "@/lib/lang";
import { Cita } from "./page";

type Props = {
  initialCitas: Cita[];
  lang: "es" | "en";
  t: (typeof import("./page").copy)["es"];
  token: string;
};

function estadoClase(estado: string): string {
  switch (estado) {
    case "confirmada":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/40";
    case "pendiente":
      return "bg-amber-500/10 text-amber-400 border-amber-500/40";
    case "cancelada":
      return "bg-rose-500/10 text-rose-400 border-rose-500/40";
    case "completada":
      return "bg-sky-500/10 text-sky-400 border-sky-500/40";
    case "no_asistio":
      return "bg-red-500/10 text-red-400 border-red-500/40";
    default:
      return "bg-slate-700/40 text-slate-200 border-slate-500/40";
  }
}

export default function CitasTable({ initialCitas, lang, t, token }: Props) {
  const [citas, setCitas] = useState<Cita[]>(initialCitas);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ type: "delete" | "finalize"; cita: Cita } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const performAction = async () => {
    if (!confirmAction) return;
    const { type, cita } = confirmAction;
    setLoadingId(cita.id);
    try {
      if (type === "delete") {
        const res = await fetch(apiUrl(`/api/citas/${cita.id}/`), {
          method: "DELETE",
          headers: { Authorization: `Token ${token}` },
        });
        if (!res.ok) throw new Error("delete failed");
        setCitas((prev) => prev.filter((c) => c.id !== cita.id));
      } else {
        const res = await fetch(apiUrl(`/api/citas/${cita.id}/`), {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Token ${token}` },
          body: JSON.stringify({ estado: "completada" }),
        });
        if (!res.ok) throw new Error("patch failed");
        setCitas((prev) => prev.map((c) => (c.id === cita.id ? { ...c, estado: "completada" } : c)));
      }
      setConfirmAction(null);
      setErrorMsg(null);
    } catch (err) {
      setErrorMsg(t.actionError);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <>
      <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/40">
        <table className="w-full text-sm">
          <thead className="bg-slate-900/80">
            <tr>
              <th className="p-3 text-left">{t.table.id}</th>
              <th className="p-3 text-left">{t.table.negocio}</th>
            <th className="p-3 text-left">{t.table.servicio}</th>
            <th className="p-3 text-left">{t.table.cliente}</th>
            <th className="p-3 text-left">{t.table.fecha}</th>
            <th className="p-3 text-left">{t.table.hora}</th>
            <th className="p-3 text-left">{t.table.estado}</th>
            <th className="p-3 text-left">{t.table.acciones}</th>
          </tr>
        </thead>

        <tbody>
          {citas.length === 0 ? (
            <tr>
              <td colSpan={8} className="p-6 text-center text-slate-500">
                {t.empty}
              </td>
            </tr>
          ) : (
            citas.map((cita) => (
              <tr key={cita.id} className="border-t border-slate-800 hover:bg-slate-900 transition-colors">
                <td className="p-3">{cita.id}</td>
                <td className="p-3">{cita.negocio_nombre}</td>
                <td className="p-3">{cita.servicio_nombre}</td>
                <td className="p-3">{cita.cliente_nombre}</td>
                <td className="p-3">{cita.fecha}</td>
                <td className="p-3">
                  {cita.hora_inicio} – {cita.hora_fin}
                </td>
                <td className="p-3">
                  <span
                    className={
                      "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium " + estadoClase(cita.estado)
                    }
                  >
                    {t.statusLabels[cita.estado] || cita.estado.replace("_", " ")}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-2 text-xs">
                    <Link href={withLangParam(`/citas/${cita.id}`, lang)} className="text-sky-400 hover:text-sky-200">
                      {t.view}
                    </Link>
                    <button
                      type="button"
                      onClick={() => setConfirmAction({ type: "finalize", cita })}
                      disabled={loadingId === cita.id}
                      className="rounded border border-emerald-400/60 px-2 py-1 text-emerald-200 hover:border-emerald-200 disabled:opacity-50"
                    >
                      {t.finalize}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmAction({ type: "delete", cita })}
                      disabled={loadingId === cita.id}
                      className="rounded border border-rose-500/60 px-2 py-1 text-rose-200 hover:border-rose-300 disabled:opacity-50"
                    >
                      {t.delete}
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      </div>

      {confirmAction && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-amber-500/40 bg-slate-900/95 p-5 shadow-2xl shadow-amber-500/20">
            <div className="flex items-start gap-3">
              <span className="mt-1 h-3 w-3 rounded-full bg-amber-400" aria-hidden />
              <div className="space-y-2 text-sm">
                <p className="font-semibold text-amber-200">
                  {confirmAction.type === "delete" ? t.confirmDelete : t.confirmFinalize}
                </p>
                <p className="text-slate-300">
                  #{confirmAction.cita.id} · {confirmAction.cita.cliente_nombre} · {confirmAction.cita.fecha}{" "}
                  {confirmAction.cita.hora_inicio} – {confirmAction.cita.hora_fin}
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setConfirmAction(null)}
                    className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 hover:border-slate-500"
                  >
                    {lang === "es" ? "Cancelar" : "Cancel"}
                  </button>
                  <button
                    type="button"
                    onClick={performAction}
                    disabled={loadingId === confirmAction.cita.id}
                    className={`rounded-lg px-3 py-2 text-xs font-semibold text-slate-950 shadow transition ${
                      confirmAction.type === "delete"
                        ? "bg-rose-400 hover:bg-rose-300 disabled:bg-rose-300/70"
                        : "bg-emerald-400 hover:bg-emerald-300 disabled:bg-emerald-300/70"
                    }`}
                  >
                    {confirmAction.type === "delete" ? t.delete : t.finalize}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="fixed bottom-4 left-1/2 z-30 w-full max-w-md -translate-x-1/2 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100 shadow-lg shadow-rose-500/20">
          {errorMsg}
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="float-right text-xs text-rose-200 underline underline-offset-4"
          >
            {lang === "es" ? "Cerrar" : "Close"}
          </button>
        </div>
      )}
    </>
  );
}
