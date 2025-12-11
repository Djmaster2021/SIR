# SIR – Sistema Inteligente de Reservaciones

Stack full‑stack para gestionar reservaciones de restaurante (Django REST + Next.js) con validaciones de agenda y control básico de mesas.

## Estructura
- `backend_django/`: API REST (Django 6 + DRF) con modelos de negocio, servicios, mesas, clientes y citas.
- `frontend_next/`: Landing y panel Next.js (App Router) con flujos `reservar`, `citas`, `config/calendar`.
- `docs/`: Documentación; ver `docs/structure.md` para árbol y convenciones. `docs/design/` para referencias visuales.
- `docker-compose.yml`: Levanta MySQL, backend y frontend en modo dev.

## Arranque rápido
1) Copia variables: `cp backend_django/.env.example backend_django/.env` y ajusta `SECRET_KEY` / DB si es necesario.  
2) Con Docker: `docker compose up --build`. Backend en `http://localhost:8000`, frontend en `http://localhost:3000`.  
   - El compose aplica migraciones, carga fixtures (`auth_seed.json`, `reservas_seed.json`) y arranca los servicios.  
3) Sin Docker (dev rápido):
   ```bash
   cd backend_django
   python -m venv .venv && source .venv/bin/activate
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py loaddata fixtures/auth_seed.json fixtures/reservas_seed.json
   python manage.py runserver
   ```
   En otra terminal:
   ```bash
   cd frontend_next
   npm install
   NEXT_PUBLIC_API_BASE=http://127.0.0.1:8000 npm run dev
   ```

## API disponible (DRF)
- `GET/POST /api/negocios/`
- `GET/POST /api/servicios/`
- `GET/POST /api/mesas/`
- `GET/POST /api/clientes/`
- `GET/POST /api/citas/` (PATCH/DELETE por ID)
- `GET /api/agenda/sugerir/?servicio=<id>&desde=YYYY-MM-DD&duracion=60&prefer_hora=HH:MM`  
  Devuelve el mejor hueco disponible según mesas activas, evitando solapes y minimizando tiempos muertos (y acercando a la hora preferida si se indica).
- Notificaciones por correo:
  - Se envían al crear/actualizar citas si cliente/propietario tienen email.
  - Recordatorios 24h antes: comando `python manage.py enviar_recordatorios` (programable en cron). Requiere configurar SMTP en `.env`.
- Endpoint público para clientes:
  - `POST /api/public/citas/` con payload: negocio, servicio, nombre, email, telefono, fecha, hora_inicio, hora_fin, notas.
  - Crea el cliente si no existe, aplica las mismas validaciones de disponibilidad y devuelve sugerencia de horario si el slot no está libre.
  - En frontend hay una página `"/reservar"` que consume este endpoint.
- Disponibilidad y tolerancia:
  - `GET /api/agenda/disponibilidad/?servicio=<id>&fecha=YYYY-MM-DD` devuelve slots disponibles considerando duración del servicio y mesas activas.
  - La hora de llegada tiene 15 minutos de tolerancia; comando `python manage.py marcar_no_show` marca como `no_asistio` citas que no llegaron a tiempo.
- Google Calendar:
  - Configura credenciales en `.env.calendar` (no versionado): `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, `GOOGLE_CALENDAR_ID`.
  - Autoriza en `GET /api/google/authorize/` y completa el flujo en `/api/google/callback/`; se guarda el token en BD.
  - Las citas crean/actualizan/eliminan eventos en el calendario (con `event_id` en la cita) y añaden al cliente como invitado si tiene email.

Validaciones clave de citas:
- Fecha no puede ser pasada; horario dentro de 13:00–23:00 y fin > inicio.
- Coherencia de negocio entre servicio y cliente.
- Cada servicio requiere mesas activas; si las citas activas (pendiente/confirmada) en el mismo horario alcanzan el número de mesas activas, se bloquea la reservación.
- Un cliente no puede tener más de una cita activa futura.

## Datos de ejemplo
`backend_django/fixtures/` incluye:
- Usuario admin (`admin` / `SIRadmin_2025!`).
- Negocio, servicios, mesas y citas válidas con fechas futuras.

## Test
```bash
cd backend_django
python manage.py test reservas
```
Se cubren reglas de cita (fecha pasada, saturación por mesas, cliente de otro negocio) y validación de capacidades de mesa.
