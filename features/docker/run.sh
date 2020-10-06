#!/bin/sh

set -e

log () {
  echo "[$(date --rfc-3339 seconds)] - $1"
}

log "Starting Kuzzle..."

exec ./bin/start-kuzzle-server
