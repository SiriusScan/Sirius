#!/bin/sh
set -eu

if [ -n "${POSTGRES_PASSWORD_FILE:-}" ] &&
    [ -z "${DB_PASSWORD:-}" ] && [ -z "${POSTGRES_PASSWORD:-}" ]; then
    POSTGRES_PASSWORD="$(cat "$POSTGRES_PASSWORD_FILE")"
    if [ -z "$POSTGRES_PASSWORD" ]; then
        printf '%s\n' 'PostgreSQL password file is empty' >&2
        exit 1
    fi
    export POSTGRES_PASSWORD
fi

CONTAINER_NAME=sirius-api /system-monitor/system-monitor >> /tmp/system-monitor.log 2>&1 &
CONTAINER_NAME=sirius-api /app/administrator >> /tmp/administrator.log 2>&1 &
exec /app/sirius-api
