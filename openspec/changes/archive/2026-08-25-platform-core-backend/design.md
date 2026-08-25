# Design: platform-core-backend

## Context

Репозиторий пуст: STRUCTURE.md (описывает модульный монолит) и `frontends/source-admin` (референс-вёрстка, не трогается). По прямому требованию владельца архитектура меняется: **не монолит** — каждый сервис является отдельным Laravel-приложением в `apps/` со своим деплоем. STRUCTURE.md остаётся источником идей по доменным моделям (таблицы, статусы, конвейер аналитики, правила Octane), но раскладка §2–§4 (единый composition root, PlatformModule/ModuleRegistry в одном процессе) заменяется межсервисными контрактами. STRUCTURE.md потребуется обновить в ходе реализации.

Стек: PHP 8.3+, Laravel (актуальный стабильный релиз), Octane + Swoole, PostgreSQL 17, Redis 7, ClickHouse, Horizon, Docker Compose.

## Goals / Non-Goals

**Goals:**
- Четыре независимых приложения: `apps/auth-service` (control plane + tenant), `apps/content-service`, `apps/analytics-service`, `apps/pay-service`; общий код — только пакеты `packages/cms/*` (логика сервисов и контракты) и `packages/frontend/*`.
- Единая точка входа: gateway (Caddy/nginx) маршрутизирует по префиксам — `/api/admin/v1/auth|projects|bootstrap → auth-service`, `/api/admin/v1/projects/{p}/content, /api/v1/content → content-service`, `.../analytics, /api/v1/collect → analytics-service`, `.../pay, /api/v1/pay, /webhooks/{provider} → pay-service`.
- API-first: bootstrap-манифест + OpenAPI на сервис — контракт для `frontends/admin` (TanStack Query, генерация типов).
- Tenant-изоляция по `project_id` в каждом сервисе.

**Non-Goals:**
- UI-код (кроме каркасов пакетов панели), event sourcing, gRPC, Kubernetes, service mesh, общая шина сообщений (в MVP — HTTP + очереди внутри сервиса).
- Распределённые транзакции между сервисами — межсервисные эффекты асинхронны и идемпотентны.

## Decisions

1. **auth-service = control plane + auth-as-a-service.** Операторы, роли/права, проекты, участники, API-ключи, включение сервисов, настройки, аудит, bootstrap — и конечные пользователи сайтов проектов. Альтернатива (отдельный projects-service) отвергнута: tenant-модель и права неразделимы, лишний сетевой прыжок на каждый запрос.
1a. **Два guard'а Sanctum в auth-service.** `admin` → таблица `admins` (операторы, глобальная); `web` → таблица `users` с `project_id` (пользователи сайтов, уникальность email per project). Раздельные таблицы вместо одной с типом — потому что жизненные циклы, поля и правила уникальности разные; смешение — самая дорогая ошибка схемы. Публичные `/api/v1/auth/{register,login,logout,reset-password,me}` резолвят проект из API-ключа сайта и работают только в его пределах; токен пользователя хранит project_id и не действует с ключом другого проекта. Introspection возвращает вид субъекта (admin / project user / api key).
1b. **Роли и права — spatie/laravel-permission в teams-режиме.** `team_id = project_id`: роли и permissions существуют строго в контексте проекта; формат прав `<service>.<resource>.<action>`, источник — манифесты сервисов (sync делает upsert в таблицы spatie). Каждый раздел админки каждого проекта закрыт соответствующим permission — маршрутов без проверки права нет. Роль `super-admin` через `Gate::before` проходит все проверки во всех проектах (вместо флага platform_admin). Кэш spatie — Redis; под Octane team-контекст (`setPermissionsTeamId`) устанавливается per-request из ProjectContext и сбрасывается между запросами. Альтернатива (самописные roles/permissions) отвергнута: spatie стандартен, teams закрывает project-scoping из коробки.
1d. **Стандартные пакеты по скиллам `.ai/skills` (каталог — в CLAUDE.md).** Медиа контента — `spatie/laravel-medialibrary` (коллекции, конверсии) вместо самописной таблицы вариантов, хранилище — S3-совместимый MinIO в compose (бакет media, отдельный volume); слаги постов/страниц — `spatie/laravel-sluggable`; audit log поверх `spatie/laravel-activitylog` (таблица activity_log + наш фасад Audit); фильтры/сортировки списков admin API — `spatie/laravel-query-builder`; nested sets — `kalnoy/nestedset`; провайдер платежей Platega — по blueprint-скиллу `payment-platega-integration-laravel`. Кодстайл — Spatie guidelines.
1c. **Строгий DDD/CQRS во всех модуль-пакетах — канонический four-layer.** Единая структура каждого пакета `packages/cms/<module>/src/` (без самодеятельности, отступления не допускаются):

```text
├── Domain/
│   ├── Models/            Eloquent-модели (инварианты, статус-машины через Enums)
│   ├── Enums/
│   ├── ValueObjects/
│   ├── Events/            доменные события
│   ├── Policies/
│   └── Contracts/         порты (интерфейсы) наружу
├── Application/
│   ├── Commands/          команды-объекты (намерение изменить состояние)
│   ├── Queries/           запросы-объекты (чтение, без побочных эффектов)
│   ├── DTOs/              spatie/laravel-data; суффикс DTO, папка на сущность:
│   │   ├── Post/          PostDTO, UpsertPostDTO, ChangePostStatusDTO
│   │   └── Category/      CategoryDTO, MoveCategoryDTO
│   └── Handlers/          обработчики команд/запросов (один Handler — один handle())
├── Infrastructure/
│   ├── Persistence/       репозитории, scopes, ClickHouse, Redis-буферы
│   ├── Providers/         адаптеры внешних провайдеров (платежи и т.п.)
│   └── Notifications/     исходящие каналы
└── Presentation/
    └── Http/Api/V1/
        ├── Controllers/   тонкие: DTO → Handler → Resource/DTO
        ├── Requests/      FormRequest-ы, если валидация не в DTO
        └── Resources/     ответные представления
```

Правила: DTO именуются с суффиксом `DTO` (не `Data`) и лежат в `Application/DTOs/<Сущность>/`; команды и запросы — объекты в `Commands/`/`Queries/`, их логика — в `Handlers/` (`<Команда>Handler`); контроллеры не содержат логики и валидации; `Jobs` — часть Infrastructure (диспатчат команды в Handlers); аудит и побочные эффекты — в Handlers. Полноценный CQRS с раздельными моделями чтения/записи не вводим — только разделение классов.
2. **Своя БД на сервис** (отдельные базы в одном инстансе Postgres 17). Никакого чтения чужих таблиц — только API. Это и есть граница сервиса; нарушение проверяется ревью и отсутствием чужих credentials в env сервиса.
3. **Аутентификация downstream-сервисов — introspection в auth-service с кэшем.** Content/analytics проверяют операторский Bearer-токен, API-ключ проекта, включённость сервиса и права одним introspection-вызовом (`POST /internal/introspect`), кэш в Redis сервиса с TTL 60–120 сек. Альтернатива — самодостаточные JWT — отвергнута для MVP: сложнее ротация/отзыв; можно мигрировать позже без смены контрактов.
4. **Service-to-service auth — статические сервисные токены** из env (по паре на связь), только по внутренней docker-сети. mTLS/OAuth client credentials — не MVP.
5. **Манифест сервиса вместо PlatformModule.** Каждый сервис хранит декларацию (key, навигация, права `<service>.<resource>.<action>`, схемы настроек) и пушит её в auth-service командой `manifest:publish` (вызывается на деплое). Auth-service делает upsert прав и схем; bootstrap собирается из зарегистрированных манифестов. Это сохраняет принцип «фича на backend ⇒ видна frontend».
6. **Вся логика в пакетах, apps — тонкие.** Две группы пакетов:
   - `packages/cms/*` (backend, composer path-пакеты): `cms/shared` — контракты и инфраструктура (HTTP-клиенты сервисов, DTO манифеста/introspection, ErrorEnvelope, курсорная пагинация, TraceId-мидлвары, ProjectContext scoped, VO Money); `cms/contracts` — JSON Schema аналитических событий и межсервисных DTO; `cms/auth`, `cms/content`, `cms/analytics`, `cms/pay` — доменные модуль-пакеты (Domain, Actions, Queries, Jobs, Presentation/Http, миграции, манифест), каждый подключается своим приложением из `apps/*`; `cms/generators` — скаффолдер `make:module`, создающий пару backend-пакет + frontend-пакет по эталону. Появление `Domain/` или `Actions/` внутри `apps/*` — ошибка раскладки; приложение содержит только провайдеры, конфиг деплоя, роуты-подключения и env.
   - `packages/frontend/*` (npm workspaces): `frontend/ui-kit` — компоненты, извлечённые из `frontends/source-admin` (строго его дизайн); `frontend/api-client` — типы и TanStack Query-хуки, генерируемые из OpenAPI-артефактов сервисов (регенерация в CI при diff'е OpenAPI — это механизм «backend-фича ⇒ frontend»); `frontend/{auth,content,analytics,pay}` — фича-пакеты панели (в этом change — каркасы). Панель `frontends/admin` собирается только из этих пакетов (следующий change).
7. **Analytics-конвейер** — как в STRUCTURE.md §7.3: `/collect` → Redis LIST (appendonly) → демон flush (батч 5000 / 2 сек) → ClickHouse ReplacingMergeTree (event_id в ORDER BY — дедупликация), dead-letter + replay, IP только соль-хэш, отчёты по MV. Всё внутри analytics-service.
8. **События из content в analytics** — асинхронно джобой с retry по service-каналу (`POST /internal/events`); недоступность аналитики не блокирует контент.
9. **Content-модель — конкретные сущности, не абстрактные типы.** Посты, страницы, категории (по требованию владельца; гибкие jsonb-типы отвергнуты как избыточные для MVP). Категории — nested sets (`kalnoy/nestedset`: lft/rgt/depth + parent_id), перемещение поддеревьев атомарно в транзакции с блокировкой дерева проекта. SEO — полиморфная таблица `seo_meta` (morphs: seoable_type/seoable_id + project_id): title, description, keywords, canonical, robots-директивы, OG, Twitter, `json_ld jsonb`. Sitemap — асинхронная регенерация джобой по изменению контента (`is_index = true` и published), хранится как артефакт и отдаётся публичным маршрутом; robots.txt генерируется из настроек проекта + Disallow закрытых разделов + ссылка на sitemap. Мультиязычность — строка на локаль с `translation_group`; горячие поля — btree, полнотекст — tsvector.
9a. **История пользователя в аналитике.** Фасад/SDK `Analytics::push($key, $history)` в `cms/shared` — тонкая обёртка над отправкой события в analytics-service (для сервисов платформы — service-канал, буферизованно через очередь). `$key` — субъект: `user:{project}:{id}`, `anon:{anon_id}`, `admin:{id}`. История хранится в том же ClickHouse `events` (ORDER BY включает субъект — выборка хронологии дешёвая); auth-service пушит register/login/logout/reset/block, content — publish, сайт — свои события через `/collect`. Admin API отдаёт полную хронологию по ключу.
9b. **pay-service.** Каталог: `plans` (тарифные планы: код, название, цена в минорных единицах, интервал биллинга) → `plan_options` (опции плана: лимиты, значения) и `features` (возможности; связь план↔feature) — всё на проект. Платежи: `payment_intents` (единоразовые; статусы `created → pending → succeeded | failed | canceled`, переходы в enum) + append-only леджер `payment_transactions`. Подписки: `subscriptions` со статус-машиной `active → paused → active` (возобновление), `canceled` (до конца оплаченного периода), soft-delete; продление джобой по расписанию. Провайдеры — интерфейс-адаптер `PaymentProvider` (createPayment/refund/verifyWebhook/parseWebhook); с первого дня `ManualProvider` (подтверждение оператором) и `NullProvider` (тесты), реальные провайдеры — отдельный change (креды на проект в настройках, encrypted). Вебхуки: `POST /webhooks/{provider}` — проверка подписи → INSERT `payment_webhook_events` (unique provider+external_id, дубль → 200) → джоба на очередь `webhooks` → 200 за <100 мс; никакой бизнес-логики в HTTP. Все операции с деньгами — идемпотентные джобы на очереди `critical`; события `payment.succeeded`, `subscription.*` — в analytics через `Analytics::push`.
10. **Octane-правила** (§10 STRUCTURE.md) действуют в каждом сервисе: scoped-контекст, запрет синглтонов с request-состоянием, `--max-requests=250`, WorkerStateLeakTest в CI каждого сервиса.
11. **OpenAPI из swagger-php аннотаций.** Контроллеры/ресурсы модуль-пакетов аннотируются (`zircote/swagger-php`); каждый сервис генерирует свой `openapi.json`, а команда `./tools/cms api` собирает их в единый общий swagger-файл (артефакт коммитится, CI сверяет diff). Из этого объединённого файла генерируется `frontend/api-client` (типы + TanStack Query-хуки) — механизм «backend-фича ⇒ frontend». Альтернатива (рукописные yaml) отвергнута: аннотации живут рядом с кодом и не расходятся с ним.
11b. **Один Dockerfile, один `docker compose up`.** Все сервисы собираются из одного общего Dockerfile (PHP 8.3 + Octane/Swoole; сервис задаётся build-arg/переменной APP_SERVICE, монтируется свой каталог apps/*), плюс контейнер фронта админки (node: dev-сервер Vite в dev, статическая сборка за gateway в prod). `docker compose up` поднимает всё: gateway, 4 сервиса, postgres, redis, clickhouse, admin-front, воркеры. Альтернатива (Dockerfile на сервис) отвергнута: тройное дублирование при идентичном рантайме.
11c. **CI/CD-конвейер** (GitHub Actions, на PR): composer install по пакетам → Pint → **Larastan** (phpstan + larastan extension, level 8) → Pest (пакеты и сервисы, матрица) → сборка npm workspaces и фронта админки → сборка docker-образа → проверка diff единого swagger (`./tools/cms api`). Deploy-workflow собирает образы и публикует compose-бандл.
11a. **Единая точка управления конфигурацией — `infra/`.** Все настройки лежат в `infra/` с раскладкой по сервисам: `infra/services/<service>/{.env.example, octane, supervisor}` + общие `infra/compose/*`, `infra/gateway/*`. Compose монтирует env каждого сервиса из его каталога; настройка системы — правка файлов одного сервиса без касания остальных. CLI-обёртка `tools/cms` (bash) — единый вход: `./tools/cms api` (сборка swagger), `./tools/cms up|down|migrate|test [service]`.
12. **Тесты**: Pest в каждом приложении + контрактные тесты introspection/манифеста (auth-service публикует фикстуры контрактов, downstream-сервисы тестируются против них).

## Risks / Trade-offs

- [Introspection — единая точка отказа и латентность на каждый запрос] → Redis-кэш результата в каждом сервисе (TTL 60–120 сек), graceful: при недоступности auth-service валидный кэш продолжает работать до TTL; public `/collect` деградирует в 503 только по истечении кэша.
- [Отзыв токена/ключа действует с задержкой TTL кэша] → осознанный компромисс, TTL ≤ 2 мин; критичные операции (смена ролей) дополнительно шлют cache-bust вебхук downstream-сервисам (best effort).
- [Дрейф контрактов между сервисами] → DTO и клиенты в `packages/shared`, контрактные тесты, версионирование `/internal` API.
- [Три приложения = тройная инфраструктура] → общий шаблон Dockerfile/supervisor, общие compose-фрагменты; стоимость принята владельцем сознательно.
- [Дубли/потери в аналитике] → ReplacingMergeTree + event_id, appendonly Redis, LTRIM после успешного INSERT, dead-letter + replay.
- [STRUCTURE.md противоречит новой архитектуре] → задача обновить STRUCTURE.md включена в tasks; до обновления источник правды по раскладке — этот design.

## Migration Plan

Greenfield. Деплой: Docker Compose — gateway, auth-service, content-service, analytics-service, postgres, redis, clickhouse; миграции каждого сервиса — отдельный шаг перед `octane:reload`. Порядок ввода: auth → content → analytics → pay (downstream зависят от introspection).

## Open Questions

- Вид bot-фильтра на `/collect` (UA-список vs эвристики) — решается при реализации, спеки не меняет.

- Переход с introspection на JWT при росте нагрузки — отложено, контракты не изменятся.
