# EDS deployment guide

This repository contains:

| Path | Stack |
|------|--------|
| `EDS_backend/` | Django 5 + DRF + JWT + PostgreSQL + Gunicorn + WhiteNoise + DigitalOcean Spaces (media) |
| `EDS_frontend/` | React (Vite) + Ant Design |

Production-oriented automation lives in:

- **`docker-compose.yml`** — one file: Postgres, Django API, nginx serving the built SPA and proxying `/api`, `/admin`, `/swagger`, etc.
- **`deploy.sh`** — `git pull`, rebuild images, recreate containers (migrations run automatically when the backend container starts).
- **`.env.example`** — template for secrets and configuration.

---

## Prerequisites

- **Docker** 24+ and **Docker Compose** v2 (`docker compose`).
- **PostgreSQL** is included in Compose; you do not need a separate Postgres install for the default layout.
- **DigitalOcean Spaces** (or S3-compatible) — the backend uses `django-storages` with a folder prefix (default `eds/…` in the bucket). Set `DO_SPACES_KEY`, `DO_SPACES_SECRET`, and `DO_SPACES_BUCKET` in `.env`. If those are missing, files fall back to local disk under `Expert_Registration/cvs/`.

---

## Environment variables

1. Copy the example file:

   ```bash
cp .env.example .env
```

2. Edit `.env` and set at least:

| Variable | Purpose |
|----------|---------|
| `SECRET_KEY` | Django secret; generate e.g. `openssl rand -hex 32` |
| `DEBUG` | `False` in production |
| `ALLOWED_HOSTS` | Comma-separated hostnames (your public domain, server IP if needed) |
| `DB_PASSWORD` | Postgres password (matches `POSTGRES_PASSWORD` for the `db` service) |
| `DO_SPACES_KEY`, `DO_SPACES_SECRET`, `DO_SPACES_BUCKET` | DigitalOcean Spaces (required for cloud media) |
| `DO_SPACES_REGION` | e.g. `nyc3`, `fra1`, `sfo3` |
| `DO_SPACES_FOLDER` | Prefix inside the bucket (default `eds`) |
| `FRONTEND_RESET_URL` | Full URL to your SPA password-reset route |
| `VITE_API_BASE_URL` | **Leave empty** when using the provided nginx setup so the browser calls `/api/...` on the same host |

Optional email variables (`EMAIL_*`) are used for SMTP password reset and similar flows.

### Database configuration

Compose wires the backend to the internal hostname `db`. You can either:

- Rely on **`DB_NAME`**, **`DB_USER`**, **`DB_PASSWORD`** (and Compose sets `DB_HOST=db`), or  
- Set **`DATABASE_URL`** (e.g. `postgresql://user:pass@db:5432/eds`) in `.env`; if present, it overrides the discrete `DB_*` fields (see `EDS_backend/EDS_backend/settings.py`).

---

## Ubuntu server setup

Typical install on **Ubuntu 22.04 / 24.04 LTS**:

1. **Docker Engine + Compose plugin** (official repo recommended):

   ```bash
   # See: https://docs.docker.com/engine/install/ubuntu/
   sudo apt update
   sudo apt install -y ca-certificates curl
   sudo install -m 0755 -d /etc/apt/keyrings
   sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
   sudo chmod a+r /etc/apt/keyrings/docker.asc
   echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "${VERSION_CODENAME}") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
   sudo apt update
   sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
   ```

2. **Run Docker without sudo** (log out after this):

   ```bash
   sudo usermod -aG docker "$USER"
   ```

3. **Firewall** (if `ufw` is enabled):

   ```bash
   sudo ufw allow OpenSSH
   sudo ufw allow 80/tcp comment 'EDS web'
   sudo ufw enable
   sudo ufw status
   ```

4. **Deploy directory**: clone the repo (e.g. `/opt/eds` or `/home/deploy/eds`), copy `.env`, then use **`deploy.sh`** from the repo root.

---

## Local development (without Docker)

### Backend

```bash
cd EDS_backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Ensure PostgreSQL is running and matches `DATABASES` in settings (env vars `DB_*` or local defaults). Then:

```bash
python manage.py migrate
python manage.py runserver
```

### Frontend

```bash
cd EDS_frontend
npm ci
# Point API at your Django origin (default in code is http://localhost:8000)
echo 'VITE_API_BASE_URL=http://localhost:8000' > .env.local
npm run dev
```

---

## Production with Docker Compose

From the **repository root** (where `docker-compose.yml` lives):

```bash
cp .env.example .env
# edit .env
docker compose up -d --build
```

- **HTTP**: nginx listens on host port `HTTP_PORT` (default **80**).
- **API**: same host, paths under **`/api/`** (proxied to Gunicorn).
- **Admin**: **`/admin/`**
- **Swagger**: **`/swagger/`**, **`/swagger.json`**, **`/redoc/`**

The backend container runs on startup:

1. `python manage.py migrate --noinput`
2. `python manage.py collectstatic --noinput`
3. Gunicorn binding `0.0.0.0:8000`

---

## One-command server deploy (`deploy.sh`)

On the server, clone the repo once, add `.env`, then from the **repository root**:

```bash
chmod +x deploy.sh
./deploy.sh
```

Optional environment variables: `GIT_BRANCH` (default `main`), `GIT_REMOTE` (default `origin`), `DC_BUILD_NO_CACHE=1` for a clean image rebuild.

The script:

1. Verifies **`.env`**, **`git`**, **Docker**, and that Docker is usable (group / daemon).
2. **`git fetch`**, checks out **`GIT_BRANCH`**, then **`git pull --ff-only`** (fails if the server has local commits that would need a merge).
3. **`docker compose build --pull`** (refresh base images; add **`DC_BUILD_NO_CACHE=1`** to force no-cache builds).
4. **`docker compose up -d --force-recreate --remove-orphans`** — **migrations run in the backend container entrypoint** (no `makemigrations` on the server).

Uses **`docker compose`** (Compose v2). If only legacy **`docker-compose`** is installed, the script falls back and warns.

### Migrations workflow

- **Developers**: create migrations locally after model changes (`python manage.py makemigrations`), commit them, push.
- **Server**: only **`migrate`** runs in the backend entrypoint — **do not** rely on `makemigrations` in production.

You can run one-off commands when needed:

```bash
docker compose exec backend python manage.py createsuperuser
docker compose logs -f backend
```

---

## HTTPS and reverse proxies

The bundled Compose file exposes plain HTTP on port 80. In production you typically:

- Put **Caddy**, **Traefik**, or **nginx** on the host in front of `web`, terminate TLS, and forward to `127.0.0.1:80`, or  
- Change Compose to publish only on `127.0.0.1` and point your edge proxy there.

Set `ALLOWED_HOSTS` and `FRONTEND_RESET_URL` to your real HTTPS URLs.

---

## Security checklist (production)

- Strong **`SECRET_KEY`** and **`DB_PASSWORD`**.
- **`DEBUG=False`**
- Tighten **`CORS_ALLOW_ALL_ORIGINS`** in `settings.py` when your SPA and API share one origin (recommended with this Compose layout).
- Rotate DigitalOcean Spaces keys and SMTP credentials if leaked.

---

## Troubleshooting

| Issue | What to check |
|-------|----------------|
| Backend exits on start | `docker compose logs backend` — often missing `SECRET_KEY` or DB connection (`DB_HOST`, `DB_PASSWORD`). |
| SPA calls wrong API | Rebuild `web` with correct `VITE_API_BASE_URL` in `.env`; empty means same-origin `/api`. |
| 400 Bad Request / Disallowed host | `ALLOWED_HOSTS` must include the hostname users type in the browser. |
| Static/admin styling broken | Ensure `collectstatic` runs (included in entrypoint) and `/static/` is proxied (included in `EDS_frontend/nginx.conf`). |