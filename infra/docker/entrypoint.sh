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

# Схема ClickHouse (analytics): без неё отчёты падают на UNKNOWN_TABLE.
# ClickHouse может подниматься дольше сервиса — ретраим.
if [ "${CLICKHOUSE_MIGRATE:-0}" = "1" ]; then
    for _ in $(seq 30); do
        php artisan clickhouse:migrate && break
        echo "clickhouse:migrate failed — retry in 2s..."
        sleep 2
    done
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

# Предустановленные инструкции генерации (идемпотентно, только content-service):
# без них сборка проекта и генерация контента падают — своей инструкции у нового
# проекта нет, а применять нечего
if [ "${INSTRUCTS_SEED:-0}" = "1" ]; then
    php artisan instructs:seed-system || true
fi

# Справочник регионов и городов (идемпотентно, только content-service): без него
# раздел «Города» пуст, а SEO городов нечему принадлежать
if [ "${CITY_SYNC:-0}" = "1" ]; then
    php artisan city:sync || true
fi

# Коллекция базы знаний под текущую размерность векторов (идемпотентно).
# Qdrant может подниматься дольше сервиса — ретраим; при исчерпании попыток
# сервис всё равно стартует, а индексация повторится сама.
if [ "${KNOWLEDGE_PROVISION:-0}" = "1" ]; then
    for _ in $(seq 30); do
        php artisan knowledge:provision && break
        echo "knowledge:provision failed — retry in 2s..."
        sleep 2
    done
fi

# Корневой оператор и стартовый проект панели (идемпотентно, только auth-service):
# без проекта консоль не показывает разделов — bootstrap собирается из его сервисов
if [ "${ADMIN_SEED:-0}" = "1" ]; then
    php artisan operator:seed || true
    php artisan project:seed || true
fi

# Каталог прав и системные роли по уже опубликованным манифестам (только
# auth-service): без него у проектов нет ролей и прав сервисов, появившихся
# с последнего выката, а операторам пришлось бы «донастраивать руками»
if [ "${PERMISSIONS_SYNC:-0}" = "1" ]; then
    php artisan permissions:sync || true
fi

# Реестр ключей локализации в таблицу localization (только content-service):
# иначе ключи новой версии доезжают до проектов лишь ночным расписанием
if [ "${LOCALIZE_SYNC:-0}" = "1" ]; then
    php artisan localize:sync || true
fi

exec "$@"
