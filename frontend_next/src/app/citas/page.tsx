// src/app/citas/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { apiUrl } from "@/lib/api";
import { Lang, normalizeLang, withLangParam } from "@/lib/lang";
import CitasTable from "./table";

export type Cita = {
  id: number;
  negocio_nombre: string;
  servicio_nombre: string;
  cliente_nombre: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: string;
  notas: string;
};

export const copy: Record<
  Lang,
  {
    title: string;
    description: string;
    newCta: string;
    table: {
      id: string;
      negocio: string;
      servicio: string;
      cliente: string;
      fecha: string;
      hora: string;
      estado: string;
      acciones: string;
    };
    empty: string;
    view: string;
    delete: string;
    finalize: string;
    confirmDelete: string;
    confirmFinalize: string;
    actionError: string;
    loginTitle: string;
    loginDescription: string;
    userLabel: string;
    passLabel: string;
    loginBtn: string;
    authError: string;
    statusLabels: Record<string, string>;
  }
> = {
  es: {
    title: "Citas",
    description: "Listado de citas registradas en el sistema SIR. Obtenidas desde /api/citas/.",
    newCta: "+ Nueva cita",
    table: {
      id: "ID",
      negocio: "Negocio",
      servicio: "Servicio",
      cliente: "Cliente",
      fecha: "Fecha",
      hora: "Hora",
      estado: "Estado",
      acciones: "Acciones",
    },
    empty: "No hay citas registradas aún.",
    view: "Ver / editar",
    delete: "Eliminar",
    finalize: "Finalizar",
    confirmDelete: "¿Eliminar esta cita?",
    confirmFinalize: "¿Marcar la cita como completada?",
    actionError: "No se pudo completar la acción. Intenta de nuevo.",
    loginTitle: "Acceso requerido",
    loginDescription: "Inicia sesión para ver y gestionar las citas del restaurante.",
    userLabel: "Usuario o email",
    passLabel: "Contraseña",
    loginBtn: "Entrar",
    authError: "Token inválido o sesión vencida. Inicia sesión de nuevo.",
    statusLabels: {
      confirmada: "confirmada",
      pendiente: "pendiente",
      cancelada: "cancelada",
      completada: "completada",
      no_asistio: "no asistió",
    },
  },
  en: {
    title: "Appointments",
    description: "Appointments registered in SIR, fetched from /api/citas/.",
    newCta: "+ New appointment",
    table: {
      id: "ID",
      negocio: "Business",
      servicio: "Service",
      cliente: "Client",
      fecha: "Date",
      hora: "Time",
      estado: "Status",
      acciones: "Actions",
    },
    empty: "No appointments yet.",
    view: "View / edit",
    delete: "Delete",
    finalize: "Complete",
    confirmDelete: "Delete this appointment?",
    confirmFinalize: "Mark appointment as completed?",
    actionError: "We couldn't perform that action. Try again.",
    loginTitle: "Sign in required",
    loginDescription: "Sign in to view and manage restaurant appointments.",
    userLabel: "User or email",
    passLabel: "Password",
    loginBtn: "Sign in",
    authError: "Invalid token or session expired. Please sign in again.",
    statusLabels: {
      confirmada: "confirmed",
      pendiente: "pending",
      cancelada: "cancelled",
      completada: "completed",
      no_asistio: "no show",
    },
  },
};

export default function CitasPage() {
  const searchParams = useSearchParams();
  const langParam = searchParams.get("lang") || undefined;
  const lang = normalizeLang(langParam);
  const t = copy[lang];
  const [token, setToken] = useState<string | null>(null);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem("sirToken") : null;
    if (stored) setToken(stored);
  }, []);

  useEffect(() => {
    const fetchCitas = async () => {
      if (!token) return;
      setLoading(true);
      setErrorMsg(null);
      try {
        const res = await fetch(apiUrl("/api/citas/"), {
          headers: { Authorization: `Token ${token}` },
          cache: "no-store",
        });
        if (res.status === 401) {
          setErrorMsg(t.authError);
          setToken(null);
          window.localStorage.removeItem("sirToken");
          setCitas([]);
          return;
        }
        if (!res.ok) throw new Error("fetch citas failed");
        const data = await res.json();
        setCitas(Array.isArray(data) ? data : []);
      } catch (err) {
        setErrorMsg(t.actionError);
      } finally {
        setLoading(false);
      }
    };
    fetchCitas();
  }, [token, t.authError, t.actionError]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      const res = await fetch(apiUrl("/api/auth/login/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginUser, password: loginPass }),
      });
      if (!res.ok) throw new Error("login failed");
      const data = await res.json();
      const tok = data?.token;
      if (!tok) throw new Error("missing token");
      window.localStorage.setItem("sirToken", tok);
      setToken(tok);
      setLoginPass("");
    } catch (err) {
      setErrorMsg(t.actionError);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t.title}</h1>
          <p className="text-slate-400">{t.description}</p>
        </div>

        {token && (
          <Link
            href={withLangParam("/citas/nueva", lang)}
            className="inline-flex items-center rounded-lg border border-emerald-500/60 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-300 hover:bg-emerald-500/20"
          >
            {t.newCta}
          </Link>
        )}
      </header>

      {!token ? (
        <div className="mx-auto max-w-md space-y-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg shadow-emerald-900/40">
          <div>
            <p className="text-sm font-semibold text-emerald-200">{t.loginTitle}</p>
            <p className="text-xs text-slate-400">{t.loginDescription}</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs text-slate-300">{t.userLabel}</label>
              <input
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
                value={loginUser}
                onChange={(e) => setLoginUser(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-300">{t.passLabel}</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 pr-16 text-sm focus:border-emerald-400 focus:outline-none"
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  className="absolute inset-y-0 right-2 my-1 rounded-md px-2 text-[11px] font-semibold text-slate-300 hover:text-emerald-200"
                >
                  {showPass ? "Ocultar" : "Ver"}
                </button>
              </div>
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 shadow shadow-emerald-500/30 hover:-translate-y-0.5 hover:shadow-emerald-500/50 transition"
            >
              {t.loginBtn}
            </button>
          </form>
          {errorMsg && <p className="text-xs text-rose-300">{errorMsg}</p>}
        </div>
      ) : (
        <>
          {errorMsg && <p className="mb-3 text-sm text-rose-300">{errorMsg}</p>}
          {loading ? (
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-sm text-slate-300">
              {lang === "es" ? "Cargando citas..." : "Loading appointments..."}
            </div>
          ) : (
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/40">
              <CitasTable initialCitas={citas} lang={lang} t={t} token={token} />
            </div>
          )}
        </>
      )}
    </main>
  );
}
