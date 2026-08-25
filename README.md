# Platform — shared multi-tenant backend

Единый backend для подключения множества проектов (сайтов) с единой системой управления через
tenant (`Project`). Четыре отдельных Laravel-приложения за одним gateway; вся логика — в
composer-пакетах `packages/cms/*`; панель управления собирается из npm-пакетов `packages/frontend/*`.

| Сервис | Что делает |
|---|---|
| **auth-service** | операторы (guard `admin`), пользователи сайтов по проекту (guard `web`), роли/права (spatie, teams), проекты, API-ключи, включение сервисов, настройки, аудит, `/bootstrap`, introspection |
| **content-service** | посты, страницы, категории (nested sets), полиморфное SEO + JSON-LD, sitemap.xml, robots.txt, медиа (S3/MinIO) |
| **analytics-service** | `/collect` → Redis-буфер → батч в ClickHouse, история пользователя `Analytics::push`, отчёты по materialized views |
| **pay-service** | тарифные планы/опции/возможности, единоразовые платежи, подписки (cancel/resume/pause/delete), идемпотентные вебхуки |

Архитектура и правила: `STRUCTURE.md`, `CLAUDE.md`; план — `openspec/changes/platform-core-backend/`.

## Быстрый старт

Требуется: Docker + Docker Compose. Весь стек поднимается одной командой:

```bash
./tools/cms up          # gateway :8080, 4 сервиса, postgres, redis, clickhouse, minio, фронт админки
./tools/cms migrate     # миграции всех сервисов
curl localhost:8080/health/auth   # health каждого сервиса: /health/{auth|content|analytics|pay}
```

Другие команды:

```bash
./tools/cms test [service]   # Pest-тесты (все сервисы или один)
./tools/cms api              # сборка единого swagger → openapi/openapi.json
./tools/cms down | ps | logs
```

## Локальная разработка без Docker

```bash
cd apps/auth-service && composer install
./vendor/bin/pest                 # тесты приложения + его пакетов
./vendor/bin/phpstan analyse      # Larastan level 8 (пакеты включены)
./vendor/bin/pint ../../packages/cms app
```

Фронтовые пакеты (npm workspaces):

```bash
npm install
npm run generate --workspace packages/frontend/api-client   # типы + TanStack Query-хуки из swagger
npm run build --workspaces --if-present
```

Панель управления `frontends/admin` живёт на Bun отдельно от npm workspaces:

```bash
cd frontends/admin
bun install
bun run dev                       # разработка
bun run build && bun run start    # production
```

Вход — оператор платформы (email + пароль, auth-service, guard `admin`); после входа
открывается дашборд `/admin`. Разделы `dashboard`, `blogs`, `categories`, `customers`,
`team` и `settings` работают на данных платформы. Меню собирается из
`GET /api/admin/v1/bootstrap`: раздел виден, только если его сервис включён для
проекта и у оператора есть объявленное для раздела право; прямой переход на
скрытый раздел уводит на `/admin/unauthorized`. Разделы без аналога в платформе
(каталог, заказы, промо, уведомления, поддержка) скрыты — их вёрстка и
демо-данные остаются в репозитории и возвращаются одной строкой карты требований.
Подробности, таблица «раздел → сервис → право» и перечень скрытых разделов —
`docs/admin-console.md`.

## Как всё связано

- Единая точка входа — gateway (Caddy), маршрутизация по префиксам: см. `infra/gateway/Caddyfile`.
- Downstream-сервисы проверяют токены и API-ключи через `POST /internal/introspect` auth-service
  (Redis-кэш, TTL 60–120 c). Выключенный для проекта сервис отвечает 404.
- Каждый сервис публикует манифест (права, навигация, схемы настроек) командой
  `php artisan manifest:publish`; консоль строится из `GET /api/admin/v1/bootstrap`.
- События всех сервисов идут в analytics через `Analytics::push($key, $history)`.
- Новый модуль: `php artisan make:module <name>` — пара пакетов backend+frontend по эталону (§6 STRUCTURE.md).

## Конфигурация

Все настройки — в `infra/`: `infra/services/<service>/.env` (пер-сервисные env), общий Dockerfile
`infra/docker/`, compose `infra/compose/compose.yaml`. Секреты сервисных вызовов — `SERVICE_TOKEN`.

## CI

`.github/workflows/pull-request.yml`: Pint → Larastan (level 8) → Pest (матрица по сервисам) →
проверка актуальности `openapi/openapi.json` → сборка npm workspaces → сборка панели на Bun
с проверкой неизменности вёрстки относительно `frontends/source-admin` → docker-образ.
Красный шаг блокирует мёрж.
