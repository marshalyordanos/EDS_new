#!/usr/bin/env bash
#
# Deploy EDS on Ubuntu (or any Linux) with Docker Compose.
#
# Serves:
#   https://eds.afridatai.com       (frontend, via nginx -> web)
#   https://api.eds.afridatai.com   (backend,  via nginx -> backend)
#
# Both domains must already have DNS A records pointing at this host before
# the first run — Let's Encrypt's HTTP-01 challenge needs that to work.
#
# Usage (once):
#   chmod +x deploy.sh
#
# Each deploy (from repo root, next to docker-compose.yml):
#   ./deploy.sh
#
# Environment (optional):
#   GIT_BRANCH=main       branch to deploy (default: main)
#   GIT_REMOTE=origin     remote name (default: origin)
#   DC_BUILD_NO_CACHE=1   add --no-cache to docker compose build
#   LETSENCRYPT_EMAIL=... email certbot uses for expiry notices (optional
#                          but recommended; falls back to --register-unsafely-without-email)
#
# Requires: git, Docker Engine + Compose v2 (`docker compose`).
# Ubuntu Docker: https://docs.docker.com/engine/install/ubuntu/
#

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

BRANCH="${GIT_BRANCH:-main}"
REMOTE="${GIT_REMOTE:-origin}"

DOMAIN_FRONTEND="eds.afridatai.com"
DOMAIN_API="api.eds.afridatai.com"

log() { printf '[%s] %s\n' "$(date -u +'%Y-%m-%dT%H:%M:%SZ')" "$*"; }
die() { log "ERROR: $*"; exit 1; }

if [[ ! -f ".env" ]]; then
  die "Missing .env — run: cp .env.example .env then set SECRET_KEY, DB_PASSWORD, CLOUD_NAME/API_KEY/API_SECRET (Cloudinary), etc."
fi

# Fail fast on required vars rather than deploying a stack that will 500 on
# the first CV/image upload. There is no local-disk fallback for uploads —
# Cloudinary credentials are mandatory, not optional.
missing=()
for var in SECRET_KEY DB_PASSWORD CLOUD_NAME API_KEY API_SECRET; do
  # Read the value from .env without exporting the whole file (avoids
  # clobbering the caller's shell env).
  val="$(grep -E "^${var}=" .env | tail -n1 | cut -d'=' -f2-)"
  [[ -z "${val}" ]] && missing+=("${var}")
done
if [[ ${#missing[@]} -gt 0 ]]; then
  die "Missing/blank required vars in .env: ${missing[*]}. Uploads and auth will not work without these — see .env.example."
fi

command -v git >/dev/null 2>&1 || die "git not installed. Ubuntu: sudo apt update && sudo apt install -y git"
command -v docker >/dev/null 2>&1 || die "Docker not installed. Ubuntu: https://docs.docker.com/engine/install/ubuntu/"

if docker compose version >/dev/null 2>&1; then
  dc() { docker compose "$@"; }
elif command -v docker-compose >/dev/null 2>&1; then
  dc() { docker-compose "$@"; }
  log "WARN: using legacy docker-compose; install docker-compose-plugin for 'docker compose'."
else
  die "Docker Compose not found. Ubuntu: sudo apt install docker-compose-plugin"
fi

if ! docker info >/dev/null 2>&1; then
  die "Cannot talk to Docker (permission denied?). Run: sudo usermod -aG docker \"\$USER\" then log out and back in, or use sudo."
fi

BUILD_ARGS=(build --pull)
if [[ "${DC_BUILD_NO_CACHE:-0}" == "1" ]]; then
  BUILD_ARGS+=(--no-cache)
fi

log "Git: fetch ${REMOTE}"
git fetch "${REMOTE}"

log "Git: checkout ${BRANCH}"
if git show-ref --verify --quiet "refs/heads/${BRANCH}"; then
  git checkout "${BRANCH}"
elif git show-ref --verify --quiet "refs/remotes/${REMOTE}/${BRANCH}"; then
  git checkout -b "${BRANCH}" "${REMOTE}/${BRANCH}"
else
  die "Branch ${BRANCH} not found on ${REMOTE}. Push it or set GIT_BRANCH."
fi

log "Git: pull --ff-only ${REMOTE}/${BRANCH}"
git pull --ff-only "${REMOTE}" "${BRANCH}"

# ── nginx config bootstrap ──────────────────────────────────────────────
# HTTP-only config always goes live first — it's what serves the ACME
# HTTP-01 challenge, and redirects everything else to HTTPS once certs
# exist. The HTTPS server blocks are added ONLY after both certs are
# confirmed present, so nginx never fails to start on a fresh host (it
# would refuse to boot if told to `ssl_certificate` a file that doesn't
# exist yet).
mkdir -p nginx/conf.d
cp nginx/conf.d/http.conf.template nginx/conf.d/default.conf
rm -f nginx/conf.d/https.conf

log "Docker: compose build (${BUILD_ARGS[*]})"
dc "${BUILD_ARGS[@]}"

log "Docker: starting db, backend, web, nginx (HTTP-only for now)"
dc up -d --force-recreate --remove-orphans db backend web nginx

# ── Certificates ─────────────────────────────────────────────────────────
cert_exists() {
  dc run --rm --entrypoint sh certbot -c "[ -f /etc/letsencrypt/live/$1/fullchain.pem ]" >/dev/null 2>&1
}

EMAIL_ARGS=(--register-unsafely-without-email)
if [[ -n "${LETSENCRYPT_EMAIL:-}" ]]; then
  EMAIL_ARGS=(-m "${LETSENCRYPT_EMAIL}" --no-eff-email)
fi

for domain in "${DOMAIN_FRONTEND}" "${DOMAIN_API}"; do
  if cert_exists "${domain}"; then
    log "Cert already exists for ${domain}, skipping issuance."
    continue
  fi
  log "Requesting Let's Encrypt cert for ${domain} (HTTP-01 via webroot)"
  dc run --rm --entrypoint certbot certbot certonly \
    --webroot -w /var/www/certbot \
    -d "${domain}" \
    --agree-tos "${EMAIL_ARGS[@]}" \
    --non-interactive \
    || die "Cert issuance failed for ${domain}. Check DNS: ${domain} must resolve to this server's public IP, and ports 80/443 must be reachable (ufw/cloud firewall)."
done

if cert_exists "${DOMAIN_FRONTEND}" && cert_exists "${DOMAIN_API}"; then
  log "Both certs present — switching nginx to HTTPS config"
  cp nginx/conf.d/https.conf.template nginx/conf.d/https.conf
  dc exec nginx nginx -s reload
else
  log "WARN: not all certs are present — nginx is still HTTP-only. Re-run ./deploy.sh once DNS/firewall issues are fixed."
fi

# certbot itself now runs as a long-lived service (see docker-compose.yml)
# that renews in a loop every 12h, so no separate cron/systemd timer needed.
log "Docker: starting certbot renewal loop"
dc up -d certbot

log "Docker: compose ps"
dc ps

log "Done. https://${DOMAIN_FRONTEND}  https://${DOMAIN_API}"
log "Ubuntu firewall (if ufw is on): sudo ufw allow 80/tcp && sudo ufw allow 443/tcp && sudo ufw reload"
log "Logs: docker compose logs -f backend   # or: web / nginx / certbot"
