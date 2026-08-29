# Postgres с запечённым init-скриптом (база на сервис) — без bind-mount:
# системы деплоя, санитизирующие монтирования, иначе оставляют стек без баз.
# Контекст сборки — infra/compose.
FROM postgres:17

COPY init-databases.sql /docker-entrypoint-initdb.d/init-databases.sql
