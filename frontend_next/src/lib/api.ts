// Punto único para la base del backend Django. Ajusta NEXT_PUBLIC_API_BASE en .env.local.
const DEFAULT_API_BASE = "http://127.0.0.1:8000";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE ?? DEFAULT_API_BASE;

export function apiUrl(path: string) {
  return `${API_BASE_URL}${path}`;
}
