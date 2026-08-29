# STRUCTURE.md — раскладка платформы

Shared-backend для подключения множества проектов (сайтов) с единым управлением через tenant
(`Project`). Четыре отдельных Laravel-приложения за единым gateway; вся логика — в composer-пакетах.
Only backend: без Inertia, React, Blade, Filament в сервисах.

Стек: PHP 8.3+, Laravel 13, Octane + Swoole, PostgreSQL 17 (база на сервис), Redis 7, ClickHouse,
Horizon, MinIO (медиа), Docker Compose, GitHub Actions. DTO — spatie/laravel-data; права —
spatie/laravel-permission (teams, `team_id = project_id`); категории — kalnoy/nestedset.

Актуальные план и решения: `openspec/changes/platform-core-backend/{design.md,tasks.md}`.
Правила для агентов: `CLAUDE.md` (+ каталог скиллов `.ai/skills`).

---

## 1. Верхний уровень

```text
/
├── apps/                          тонкие composition root'ы (без Domain/Application внутри!)
│   ├── auth-service/              control plane: операторы, пользователи сайтов, tenant, права, bootstrap
│   ├── content-service/           посты, страницы, категории (nested sets), SEO, sitemap, robots, медиа
│   ├── analytics-service/         /collect, Redis-буфер → ClickHouse, история пользователя, отчёты
│   └── pay-service/               платежи, подписки, тарифные планы/опции/возможности
├── packages/
│   ├── cms/                       backend-пакеты (composer path)
│   │   ├── shared/                ProjectContext, ErrorEnvelope, auth-client (introspection), Money, Analytics::push
│   │   ├── contracts/             DTO манифестов/introspection, JSON Schema аналитических событий
│   │   ├── auth/ content/ analytics/ pay/     модуль-пакеты (структура §2)
│   │   └── generators/            make:module — скаффолд пары backend+frontend пакетов
│   └── frontend/                  npm workspaces: ui-kit (по frontends/source-admin), api-client
│       │                          (типы+TanStack Query из swagger), фича-пакеты auth/content/analytics/pay
├── frontends/
│   ├── source-admin/              референс-вёрстка (источник правды дизайна, не менять)
│   └── admin/                     панель управления (Vite + React + TanStack Query из packages/frontend)
├── infra/
│   ├── docker/                    Dockerfile PHP-сервисов (APP_SERVICE), entrypoint (бутстрап), образы панели и docs
│   ├── compose/                   compose.yaml (производственный, env-дефолты) + compose.dev.yaml + .env.example
│   ├── gateway/                   traefik.yml + dynamic.yml — матрица маршрутизации по префиксам
│                                  (воркеры, флаш и планировщики — сервисами compose)
├── tools/cms                      CLI: up|down|migrate|test [service], api (сборка единого swagger)
├── openspec/                      планирование (spec-driven)
└── CLAUDE.md · STRUCTURE.md
```

## 2. Канонический модуль-пакет (строго; исключения — библиотеки shared/contracts/generators и пакеты без сущностей/HTTP, см. CLAUDE.md)

```text
packages/cms/<module>/src/
├── Domain/
│   ├── Models/            Eloquent-модели (BelongsToProject, инварианты)
│   ├── Enums/             статус-машины: переходы только через canTransitionTo()
│   ├── ValueObjects/
│   ├── Events/
│   ├── Policies/
│   └── Contracts/         порты (интерфейсы) наружу
├── Application/
│   ├── Commands/          команды-объекты (изменение состояния)
│   ├── Queries/           запросы-объекты (чтение, без побочных эффектов)
│   ├── DTOs/              spatie/laravel-data, суффикс DTO, папка на сущность
│   │   └── Post/UpsertPostDTO.php …
│   └── Handlers/          <Команда>Handler — вся бизнес-логика, один handle()
├── Infrastructure/
│   ├── Persistence/       репозитории, ClickHouse, Redis-буферы, Jobs, кэши
│   ├── Providers/         сервис-провайдер пакета (<Module>ServiceProvider)
│   ├── Gateways/          адаптеры внешних провайдеров (PaymentProvider и т.п.)
│   └── Notifications/
└── Presentation/
    └── Http/Api/V1/
        ├── Controllers/   тонкие: FormRequest → DTO → Handler → Resource
        ├── Requests/      FormRequests — вся HTTP-валидация
        └── Resources/     JsonResources — все ответы (envelope ApiResponse)
плюс: config/ database/{migrations,factories} routes/ tests/ composer.json (extra.laravel.providers)
```

## 3. Маршруты через gateway

```text
/api/admin/v1/auth|me|bootstrap|projects*        → auth-service (Sanctum guard admin)
/api/admin/v1/projects/{p}/content/*             → content-service   (права content.*)
/api/admin/v1/projects/{p}/analytics/*           → analytics-service (права analytics.*)
/api/admin/v1/projects/{p}/pay/*                 → pay-service       (права pay.*)
/api/v1/auth/*                                   → auth-service (guard web, проект из API-ключа)
/api/v1/content/*  /sitemap.xml  /robots.txt     → content-service (API-ключ проекта)
/api/v1/collect                                  → analytics-service (public key, scope collect)
/api/v1/pay/*  /webhooks/{provider}              → pay-service
/health/<service>                                → health каждого сервиса
```

## 4. Межсервисные контракты

- **Introspection**: downstream-сервисы проверяют операторские токены (guard admin), токены
  пользователей сайтов (guard web) и API-ключи одним вызовом `POST /internal/introspect`
  (auth-service), кэш в Redis сервиса, TTL 60–120 c. Ответ: вид субъекта, project_id, права/scopes,
  включённые сервисы.
- **Манифесты**: каждый сервис декларирует права/навигацию/схемы настроек и публикует их командой
  `manifest:publish` → auth-service; `GET /api/admin/v1/bootstrap` собирает консоль из манифестов.
- **События**: `Analytics::push($key, $history)` (фасад в cms/shared) → очередь → POST
  /internal/events analytics-service; ключи субъектов `user:{project}:{id}` / `anon:{id}` /
  `admin:{id}`. Вся история пользователя читается из админки.
- **Service-to-service auth**: заголовок `Authorization: Service <token>` (env, docker-сеть).
- Выключенный для проекта сервис → 404 (`EnsureServiceEnabled`), данные не удаляются.

## 5. Правила (сокращённо; полный список — CLAUDE.md)

- `project_id` в каждой бизнес-таблице; scoped `ProjectContext`; в джобы — только ID + явный project_id.
- Деньги — целые минорные единицы (Money VO); float запрещён.
- ClickHouse: только батч-INSERT из демона `analytics:flush` (Redis LIST → dead-letter → replay);
  из HTTP-запроса ClickHouse не трогать; сырой IP не хранить (соль-хэш).
- Каждый admin-маршрут закрыт permission; super-admin — глобальная роль через Gate::before.
- Октейн-гигиена: scoped вместо singleton для request-состояния, --max-requests=250, WorkerStateLeakTest.
- Тесты Pest в каждом приложении + тесты пакетов в testsuite Packages; Larastan level 8; Pint.

## 6. Как добавить новый сервис-модуль

1. `make:module <name>` (cms/generators) — пара пакетов backend+frontend по эталону §2.
2. Заполнить манифест (права, навигация, настройки), домен, handlers, контроллеры.
3. `composer require` в своём приложении apps/<name>-service (или подключить к существующему),
   маршрут в `infra/gateway/dynamic.yml`, переменные — в env-якоря `infra/compose/compose.yaml`.
4. `manifest:publish` — модуль появляется в bootstrap, права — в ролях.
