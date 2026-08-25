#!/usr/bin/env bash
set -euo pipefail

cd "/var/www/apps/${APP_SERVICE}"

# .env сервиса лежит в infra/services/<service>/ и монтируется compose'ом
if [ ! -f .env ] && [ -f "/var/www/infra/services/${APP_SERVICE}/.env" ]; then
    cp "/var/www/infra/services/${APP_SERVICE}/.env" .env
fi

if [ ! -d vendor ]; then
    composer install --no-interaction --no-scripts
fi

# Ждём Postgres, чтобы миграции/старт не падали на гонке
if [ -n "${DB_HOST:-}" ]; then
    until php -r 'exit(@fsockopen(getenv("DB_HOST"), (int) (getenv("DB_PORT") ?: 5432)) ? 0 : 1);' 2>/dev/null; do
        echo "waiting for ${DB_HOST}..."
        sleep 1
    done
fi

if [ "${AUTO_MIGRATE:-0}" = "1" ]; then
    php artisan migrate --force || true
fi

exec "$@"
