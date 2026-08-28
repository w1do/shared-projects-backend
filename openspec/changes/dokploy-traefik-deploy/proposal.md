# Proposal: dokploy-traefik-deploy

## Why

Стек сейчас заточен под dev: gateway на Caddy, настройки размазаны по четырём per-service `.env`-файлам, PHP-контейнеры работают через bind-mount исходников (на чистом клоне без `vendor/` не стартуют), панель собирается при каждом старте контейнера, а бутстрап (манифесты, оператор) выполняется вручную скриптом. Развернуть проект на сервере (Dokploy, тип сервиса «compose») одной командой невозможно. Нужен производственный деплой «в одну команду»: все настройки в одном месте (`infra/`), минимум обязательных переменных с дефолтами прямо в compose, Traefik вместо Caddy как единственный gateway и единая интерактивная документация API на `/api/docs`.

## What Changes

- **BREAKING (инфраструктура)** Caddy полностью удаляется; единственным gateway становится Traefik внутри стека с конфигурацией файлами в `infra/gateway/` (не docker-labels) — та же матрица маршрутизации: модульные admin-пути content/analytics/pay, catch-all auth, публичные маршруты, `/health/<service>`, панель как fallback.
- Compose становится самодостаточным и production-ready: пути относительны файлу (запуск `docker compose -f infra/compose/compose.yaml up -d` из любого каталога и из Dokploy без `--project-directory`), PHP-сервисы и панель работают из собранных образов без bind-mount; dev-режим (монтирование исходников, локальные порты) выносится в отдельный override-файл, `./tools/cms` обновляется.
- Все настройки консолидируются: per-service `env_file` уходят, переменные приложений задаются в compose `environment`-блоками с дефолтами (`${VAR:-default}`); секреты и домен — минимальный корневой env (в Dokploy — переменные окружения проекта), пример — `infra/compose/.env.example`. Без переопределений стек стартует в dev-режиме на dev-дефолтах.
- Автоматический бутстрап при старте: миграции (есть), публикация манифестов сервисов и создание корневого оператора из переменных — идемпотентно; после `up` на чистой машине панель сразу доступна для входа.
- Панель получает production-образ (multi-stage сборка), вместо `bun install && build` при каждом старте контейнера.
- Новый сервис документации: единый Swagger UI поверх собранного `openapi/openapi.json` (все 4 сервиса), доступный через gateway по `/api/docs` (спека — `/api/docs/openapi.json`).

## Capabilities

### New Capabilities

- `deploy/compose-stack`: развёртывание одной командой — самодостаточный compose, консолидация настроек в `infra/` с минимумом обязательных переменных и дефолтами, автоматический бутстрап, персистентность данных, совместимость с Dokploy (service → compose).
- `deploy/traefik-gateway`: Traefik как единственный gateway стека — файловая конфигурация, полная матрица маршрутизации текущего контракта, работа за внешним прокси (Dokploy) и локально на настраиваемом порту.
- `deploy/api-docs`: единая интерактивная документация API всех сервисов на `/api/docs` через gateway.

### Modified Capabilities

Нет: требование `shared-platform` «стек одной командой docker compose» сохраняется и уточняется новыми capabilities; HTTP-контракты сервисов не меняются — меняется только реализация gateway и упаковка стека.

## Impact

- **`infra/`**: `gateway/Caddyfile` удаляется → `gateway/traefik.yml` + `gateway/dynamic.yml`; `compose/compose.yaml` переписывается (относительные пути, environment-дефолты, Traefik, swagger-ui, прод-образы), добавляются `compose/compose.dev.yaml` (override) и `compose/.env.example`; `docker/Dockerfile` — самодостаточные образы, новый Dockerfile панели; `docker/entrypoint.sh` — бутстрап манифестов/оператора.
- **`tools/`**: `cms` (up/down/migrate/artisan/e2e — новые `-f`-флаги, без `--project-directory`), `smoke.sh` — без изменений контракта (тот же `localhost:8080`).
- **Сервисы/пакеты**: код не меняется; используется существующая команда публикации манифестов и merged swagger (`./tools/cms api` → `openapi/openapi.json`).
- **Dev-окружение**: `infra/services/*/.env` перестают быть обязательными (переменные — из compose); `.env.local` для секретов (OPENAI, Platega) сохраняется как опциональный.
- **Деплой**: Dokploy service → compose, путь `infra/compose/compose.yaml`, домен вешается на сервис gateway; прод переопределяет ~8–12 секретных переменных.
- **Проверки**: smoke, e2e и `./tools/cms bootstrap` должны пройти на новом стеке без правок своих контрактов.
