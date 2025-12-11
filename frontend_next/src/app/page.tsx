// src/app/page.tsx

import { apiUrl } from "@/lib/api";

async function getNegocios() {
  const res = await fetch(apiUrl("/api/negocios/"), {
    cache: "no-store",
  });

  if (!res.ok) {
    console.error("Error al cargar negocios. Status:", res.status);
    return [];
  }

  return res.json();
}

export default async function HomePage() {
  const negocios = await getNegocios();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <h1 className="text-3xl font-bold mb-6">SIR – Panel de Negocios</h1>

      <p className="mb-4 text-slate-400">
        Datos obtenidos desde <code>/api/negocios/</code> del backend Django.
      </p>

      <div className="border border-slate-700 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-900">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Nombre</th>
              <th className="p-3 text-left">Dirección</th>
              <th className="p-3 text-left">Teléfono</th>
              <th className="p-3 text-left">Activo</th>
            </tr>
          </thead>
          <tbody>
            {negocios.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-slate-500">
                  No hay negocios registrados aún.
                </td>
              </tr>
            ) : (
              negocios.map((negocio: any) => (
                <tr key={negocio.id} className="border-t border-slate-800">
                  <td className="p-3">{negocio.id}</td>
                  <td className="p-3">{negocio.nombre}</td>
                  <td className="p-3">{negocio.direccion}</td>
                  <td className="p-3">{negocio.telefono}</td>
                  <td className="p-3">{negocio.activo ? "Sí" : "No"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
