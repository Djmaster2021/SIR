## Estructura sugerida del proyecto

```
SIR/
├── backend_django/          # API Django + DRF (citas, mesas, Google Calendar)
│   ├── core/                # settings, urls, wsgi/asgi
│   ├── reservas/            # app principal (modelos, views, señales, tests)
│   ├── fixtures/            # datos de ejemplo
│   └── requirements.txt     # dependencias backend
├── frontend_next/           # Next.js (app router)
│   ├── src/app/             # páginas, rutas API internas y layouts
│   │   ├── page.tsx         # landing principal (CTA agendar)
│   │   ├── reservar/        # flujo público de reservas
│   │   ├── citas/           # panel de citas
│   │   └── config/calendar/ # estado y resync de Google Calendar
│   ├── src/lib/             # helpers (api base, etc.)
│   └── package.json
├── docs/                    # documentación y assets de diseño
│   ├── structure.md         # este archivo (árbol y convenciones)
│   └── design/              # referencias visuales, mockups
├── infra/                   # infra/ops (docker, despliegues)
├── docker-compose.yml       # stack dev
└── README.md                # guía general de arranque y uso
```

### Convenciones
- **Frontend**: agrupa páginas por flujo (`reservar`, `citas`, `config`) y coloca utilidades en `src/lib/`. Los estilos globales viven en `src/app/globals.css`.
- **Backend**: toda la lógica de negocio en la app `reservas/`; nuevos comandos en `reservas/management/commands/`; vistas públicas separadas en `api_public.py`; sincronización externa en `google_sync.py`.
- **Diseño**: guarda imágenes de referencia en `docs/design/` (no se versionan binarios pesados si no es necesario; usa enlaces o lightweight assets).
- **Env**: variables en `backend_django/.env` y `backend_django/.env.calendar`; para frontend usa `.env.local` con `NEXT_PUBLIC_API_BASE`.
- **Tests**: coloca tests por app (`reservas/tests.py`). Si crecen, subdivide en `reservas/tests/` con módulos por tema.
