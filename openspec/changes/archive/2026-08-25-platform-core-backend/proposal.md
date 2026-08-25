# Proposal: platform-core-backend

## Why

Нужен единый shared-backend для подключения разных проектов (сайтов) с единой системой управления через tenant (`Project`). Репозиторий пуст (STRUCTURE.md и `frontends/source-admin` с референс-вёрсткой). Чтобы админка `frontends/admin` (REST API + TanStack Query) и сайты проектов могли подключиться, в первую очередь нужны три сервиса.

Архитектура — **отдельные приложения** (по требованию владельца, это осознанное отступление от STRUCTURE.md): каждый сервис — самостоятельное Laravel-приложение в `apps/`, со своей БД-схемой, своим деплоем и своим REST API. Общее — только пакеты контрактов в `packages/`. Только backend: никакого Inertia, React, Blade.

Принцип «фича реализована на backend ⇒ автоматически доступна frontend»: каждый сервис публикует OpenAPI-контракт и вносит вклад в bootstrap-манифест админки (навигация, права, схемы настроек), из которых фронтенд генерирует типы и строит интерфейс.

## What Changes

- Раскладка репозитория: `apps/auth-service`, `apps/content-service`, `apps/analytics-service`, `apps/pay-service` — четыре независимых Laravel-приложения, **тонкие composition root'ы без бизнес-логики**. Вся логика — в пакетах:
  - `packages/cms/*` — backend-пакеты: `shared` (tenant-контекст, формат ошибок, service-to-service auth-клиент, VO), `contracts` (DTO манифестов/introspection, JSON Schema событий), модуль-пакеты `auth`, `content`, `analytics`, `pay` (домен, Actions, HTTP-слой — подключаются соответствующим приложением), генераторы (`make:module` — скаффолд пары backend+frontend пакетов).
  - `packages/frontend/*` — пакеты, из которых строится панель управления: `ui-kit` (компоненты по вёрстке `frontends/source-admin`), `api-client` (типы и TanStack Query-хуки, генерируемые из OpenAPI), фича-пакеты по модулям (`auth`, `content`, `analytics`, `pay`). В этом change — структура, тулинг и генерация api-client; сами экраны админки — следующий change.
  - `infra/` — один общий Dockerfile для всех сервисов (различаются target/командой запуска); весь стек (gateway, четыре сервиса, postgres, redis, clickhouse, фронт админки) поднимается одной командой `docker compose up`.
- CI/CD: на каждый PR — тесты (Pest), сборка кода (composer + npm workspaces), статический анализ Larastan, сборка/поднятие фронта админки; красный билд блокирует мёрж.
- **auth-service** (control plane): два guard'а Sanctum — `admin` (операторы платформы) и `web` (конечные пользователи сайтов проектов). Операторы: аутентификация, роли/права в формате `<service>.<resource>.<action>` в контексте проекта, tenant-модель (projects, участники, API-ключи проектов, включение сервисов на проект, настройки, audit log), `GET /api/admin/v1/bootstrap`. Конечные пользователи: хранятся **по проекту** (изоляция по `project_id`), публичное API `/api/v1/auth/{register,login,logout,reset-password,me}` работает с любого проекта по его API-ключу, выдаёт Sanctum-токены; управление пользователями проекта из админки. Плюс introspection обоих видов токенов для остальных сервисов.
- **content-service**: посты (статусы `draft → scheduled → published → archived`, ревизии, локали), страницы (slug, `is_index`), категории на **nested sets** с неограниченной вложенностью и перемещением поддеревьев, **полиморфное SEO** со всеми полями (title/description/keywords/canonical/robots/OG/Twitter + JSON-LD schema.org) для любой сущности, генератор **sitemap.xml** по `is_index`, генератор **robots.txt** на основе данных проекта, медиа; публичное API по API-ключу проекта; авторизация через auth-service.
- **analytics-service**: приём событий `POST /api/v1/collect` (public key, rate limit, bot filter), Redis-буфер → батч-INSERT в ClickHouse демоном, materialized views, отчётные Admin API; **полная история пользователя** через `Analytics::push($key, $history)` (регистрация → push, вход → push, вся хронология субъекта запрашивается из админки).
- Межсервисное взаимодействие: проверка операторских токенов и API-ключей — через auth-service (introspection + кэш); каждый сервис регистрирует свой манифест (навигация, права, схемы настроек) в auth-service.
- Документация API: swagger-php аннотации в коде каждого сервиса; команда `./tools/cms api` собирает единый общий swagger-файл (коммитится, CI сверяет) — из него генерируется `frontend/api-client` для `frontends/admin`.
- Конфигурация системы централизована в `infra/` с раскладкой по сервисам (env, octane, supervisor на сервис) — каждый сервис настраивается независимо; CLI `tools/cms` — единая точка управления (up/down/migrate/test/api).
- **pay-service**: приём платежей — единоразовые платежи и подписки с полным управлением жизненным циклом (отменить, возобновить, приостановить, удалить); хранение тарифных планов, опций и возможностей (features) на проект; провайдеры через адаптер (Manual/Null с первого дня), идемпотентные вебхуки; деньги только в минорных единицах.
- **Не входит**: любой frontend-код (кроме каркасов пакетов панели).

## Capabilities

### New Capabilities

- `shared-platform`: общие контракты сервисов — tenant-контекст, единый формат ошибок/пагинации, service-to-service аутентификация, регистрация манифеста сервиса, VO (деньги в минорных единицах).
- `auth-service`: аутентификация операторов (guard `admin`) и конечных пользователей сайтов по проекту (guard `web`), роли/права на проект, tenant-модель (проекты, участники, API-ключи, включение сервисов, настройки, аудит), bootstrap-манифест консоли, introspection для других сервисов.
- `content-service`: посты, страницы, категории на nested sets, полиморфное SEO (включая JSON-LD/schema.org), генераторы sitemap.xml и robots.txt, медиа, публичное API.
- `analytics-service`: приём и буферизованная запись событий в ClickHouse, полная история пользователя (`Analytics::push`), агрегаты и отчётные API.
- `pay-service`: единоразовые платежи, подписки (cancel/resume/pause/delete), тарифные планы, опции и возможности, провайдеры-адаптеры, идемпотентные вебхуки.

### Modified Capabilities

нет (существующих спецификаций нет).

## Impact

- Новый код: `apps/{auth-service,content-service,analytics-service,pay-service}` (тонкие), `packages/cms/*` (backend-пакеты, contracts, генераторы), `packages/frontend/*` (ui-kit, api-client, фича-пакеты — каркас и генерация), `infra/` (compose, gateway, supervisor).
- Инфраструктура: PostgreSQL 17 (база на сервис), Redis 7, ClickHouse, Octane + Swoole, Horizon, reverse proxy/gateway.
- API: единая точка входа через gateway — `/api/admin/v1/*` (операторы), `/api/v1/*` (сайты проектов по ключу), `/health` на сервис. OpenAPI-артефакты для генерации типов админки.
- `frontends/source-admin` не трогаем (референс дизайна); `frontends/admin` — вне этого change.
