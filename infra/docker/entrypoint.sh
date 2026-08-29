#!/usr/bin/env bash
set -euo pipefail

cd "/var/www/apps/${APP_SERVICE}"

# Dev-ветка: bind-mount исходников без установленных зависимостей
if [ ! -d vendor ]; then
    composer install --no-interaction --no-scripts
fi

# Самолечение манифеста пакетов: при bind-mount в bootstrap/cache могут лежать
# устаревшие хостовые FQCN; кэш регенерируется на старте
rm -f bootstrap/cache/packages.php bootstrap/cache/services.php

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

# Публикация манифеста сервиса в реестре платформы (auth-service может стартовать
# позже — ретраим, при исчерпании попыток сервис всё равно поднимается)
if [ "${MANIFEST_PUBLISH:-0}" = "1" ]; then
    for _ in $(seq 30); do
        if php artisan manifest:publish; then
            if [ "${APP_SERVICE}" = "pay-service" ]; then
                php artisan manifest:publish-licensing || true
            fi
            break
        fi
        echo "manifest:publish failed — retry in 2s..."
        sleep 2
    done
fi

# Корневой оператор и стартовый проект панели (идемпотентно, только auth-service):
# без проекта консоль не показывает разделов — bootstrap собирается из его сервисов
if [ "${ADMIN_SEED:-0}" = "1" ]; then
    php artisan operator:seed || true
    php artisan project:seed || true
fi

exec "$@"
