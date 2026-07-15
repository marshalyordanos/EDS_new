#!/usr/bin/env bash
set -euo pipefail

echo "[entrypoint] Running migrations..."
python manage.py migrate --noinput

echo "[entrypoint] Collecting static files..."
python manage.py collectstatic --noinput

echo "[entrypoint] Starting Gunicorn..."
exec gunicorn EDS_backend.wsgi:application \
  --bind "0.0.0.0:8000" \
  --workers "${GUNICORN_WORKERS:-3}" \
  --access-logfile - \
  --error-logfile -
