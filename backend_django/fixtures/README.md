# Fixtures de datos

- `auth_seed.json`: usuarios (incluye `admin` con contraseña `SIRadmin_2025!` y cualquier usuario previo migrado).
- `reservas_seed.json`: negocio, servicios, clientes y citas de ejemplo.

Cómo cargar:
```bash
. .venv/bin/activate
python manage.py loaddata fixtures/auth_seed.json fixtures/reservas_seed.json
```
