#!/usr/bin/env bash
#
# Deploy EDS on Ubuntu (or any Linux) with Docker Compose.
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
#
# Requires: git, Docker Engine + Compose v2 (`docker compose`).
# Ubuntu Docker: https://docs.docker.com/engine/install/ubuntu/
#

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

BRANCH="${GIT_BRANCH:-main}"
REMOTE="${GIT_REMOTE:-origin}"

log() { printf '[%s] %s\n' "$(date -u +'%Y-%m-%dT%H:%M:%SZ')" "$*"; }
die() { log "ERROR: $*"; exit 1; }

if [[ ! -f ".env" ]]; then
  die "Missing .env — run: cp .env.example .env then set SECRET_KEY, DB_PASSWORD, DO_SPACES_* (if using Spaces), etc."
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

log "Docker: compose build (${BUILD_ARGS[*]})"
dc "${BUILD_ARGS[@]}"

log "Docker: compose up -d --force-recreate --remove-orphans"
dc up -d --force-recreate --remove-orphans

log "Docker: compose ps"
dc ps

log "Done. Stack is up. HTTP: port ${HTTP_PORT:-80} (set HTTP_PORT in .env)."
log "Ubuntu firewall (if ufw is on): sudo ufw allow ${HTTP_PORT:-80}/tcp && sudo ufw reload"
log "Logs: docker compose logs -f backend   # or: docker compose logs -f web"