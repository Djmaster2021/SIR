# Despliegue en producción (Docker)

Stack productivo basado en `docker-compose.prod.yml` con:
- MySQL 8.4 (volumen persistente `db_data`)
- Django + Gunicorn + WhiteNoise para estáticos
- Next.js con build `standalone`

## 1) Configura variables
1. Backend: copia `backend_django/.env.example` a `backend_django/.env` y ajusta:
   - `SECRET_KEY` (seguro) y `DEBUG=False`
   - `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, `CSRF_TRUSTED_ORIGINS`
   - SMTP si quieres correos y credenciales de Google en `.env.calendar` (opcional)
2. Frontend: copia `frontend_next/.env.production.example` a `frontend_next/.env.production` y pon la URL pública del backend en `NEXT_PUBLIC_API_BASE`.
3. Infra: copia `infra/.env.prod.example` a `infra/.env.prod` y define credenciales de MySQL, dominios permitidos y (opcional) `GUNICORN_WORKERS`.

## 2) Construye y arranca
```bash
# Desde la raíz del repo
docker compose --env-file infra/.env.prod -f docker-compose.prod.yml up -d --build
```
- El backend espera a MySQL, aplica migraciones y levanta Gunicorn.
- WhiteNoise sirve los estáticos generados en build.
- Los contenedores reinician con `unless-stopped`.
- MP usa sandbox por defecto (`MP_USE_SANDBOX=true`), cambia a `false` en `infra/.env.prod` para cobrar real.

## 3) Verifica
- API: `curl -I http://localhost:8000/`
- Front: abre `http://localhost:3000/`
- Logs: `docker compose -f docker-compose.prod.yml logs -f backend` (o `frontend`, `db`).

## Notas
- Si expones detrás de un proxy TLS, deja `SECURE_SSL_REDIRECT=True` y `SECURE_PROXY_SSL_HEADER` ya está configurado.
- No se cargan fixtures en prod; crea tu superusuario con `docker compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser`.
- Para restaurar DB, reusa el volumen `db_data` o monta un dump manualmente.
