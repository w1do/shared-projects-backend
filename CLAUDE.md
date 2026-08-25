# CLAUDE.md — правила работы агента в этом репозитории

Платформа: shared-backend из четырёх отдельных Laravel-приложений (`apps/auth-service`, `apps/content-service`, `apps/analytics-service`, `apps/pay-service`) за единым gateway. Вся логика — в пакетах `packages/cms/*`, панель управления строится из `packages/frontend/*`. Only backend: никакого Inertia, Blade, Filament в сервисах. Планирование — OpenSpec (`openspec/changes/platform-core-backend`), архитектурные решения — в его `design.md`.

## Обязательные правила

- **Строгий DDD/CQRS, канонический four-layer** в каждом модуль-пакете `packages/cms/<module>/src/` — без самодеятельности, ровно эта структура:

```text
├── Domain/
│   ├── Models/            Eloquent-модели
│   ├── Enums/             статус-машины (переходы в enum-методах)
│   ├── ValueObjects/
│   ├── Events/
│   ├── Policies/
│   └── Contracts/         порты (интерфейсы)
├── Application/
│   ├── Commands/          команды-объекты (изменение состояния)
│   ├── Queries/           запросы-объекты (чтение, без побочных эффектов)
│   ├── DTOs/              суффикс DTO, ПАПКА НА СУЩНОСТЬ: DTOs/Post/UpsertPostDTO.php
│   └── Handlers/          <Команда>Handler / <Запрос>Handler, один handle()
├── Infrastructure/
│   ├── Persistence/       репозитории, ClickHouse, Redis-буферы, Jobs
│   ├── Providers/         адаптеры внешних провайдеров
│   └── Notifications/
└── Presentation/
    └── Http/Api/V1/
        ├── Controllers/   тонкие: DTO → Handler → Resource
        ├── Requests/
        └── Resources/
```

- **DTO**: только `spatie/laravel-data`; имя класса заканчивается на `DTO` (НЕ `Data`); файл лежит в `Application/DTOs/<Сущность>/`. Валидация — rules() в DTO; контроллеры без `$request->validate()` и без ручных массивов ответов.
- **Handlers**: вся бизнес-логика команд/запросов в `Application/Handlers/`; контроллер только принимает DTO, вызывает Handler, возвращает DTO/Resource. Аудит и побочные эффекты — в Handlers.
- Laravel best practices: конструкторная инъекция (никаких `app()`/`resolve()` в Domain/Application), события Laravel для доменных событий, Policy для авторизации сущностей, spatie-кодстайл (`.ai/skills/spatie-laravel-php`).
- **Tenant-изоляция**: каждая бизнес-таблица имеет `project_id`; модели используют `BelongsToProject`; контекст — scoped `ProjectContext` (Octane-safe, никаких синглтонов с request-состоянием).
- **Деньги** — только целые минорные единицы (`Cms\Shared\Values\Money`), float запрещён везде.
- **Права** — spatie/laravel-permission, teams-режим (`team_id = project_id`), формат `<service>.<resource>.<action>`, роль `super-admin` через `Gate::before`. Каждый admin-маршрут закрыт правом.
- Тяжёлое/внешнее — только в Jobs (ID вместо моделей, явный `project_id`, идемпотентность, `failed()` → audit).

## Скиллы `.ai/skills/**` — читать SKILL.md перед соответствующей работой

Архитектура и код:
- `.ai/skills/architecture-ddd` — правила DDD-архитектуры слоёв. Применять при проектировании любого модуль-пакета.
- `.ai/skills/refactoring-ddd` — методика рефакторинга к DDD/CQRS/DTO. Применять при переработке "раздутых" контроллеров и legacy-кода.
- `.ai/skills/dtos` — типизированные DTO между слоями (spatie/laravel-data). Применять при создании любых входных/выходных DTO-классов.
- `.ai/skills/spatie-laravel-php` — стандарты кода Spatie для Laravel/PHP (контроллеры, модели, маршруты, миграции, тесты). Применять при любом написании PHP.
- `.ai/skills/spatie-javascript` — стандарты Spatie для JS/TS. Применять в `packages/frontend/*` и `frontends/admin`.
- `.ai/skills/clean-project` — превращение копии проекта в чистый скелет (команда `/clean-development`).

Laravel-пакеты:
- `.ai/skills/laravel-permission-development` — spatie/laravel-permission: роли, права, teams, middleware, policies. Применять во всём, что касается доступа (cms/auth).
- `.ai/skills/laravel-query-builder` — spatie/laravel-query-builder: фильтры/сортировки/includes в API-эндпоинтах списков.
- `.ai/skills/lazychaser-laravel-nestedset` — nested sets (kalnoy/nestedset): деревья категорий, перемещение поддеревьев (cms/content).
- `.ai/skills/sluggable-development` — spatie/laravel-sluggable: слаги постов/страниц, self-healing URLs (cms/content).
- `.ai/skills/medialibrary-development` — spatie/laravel-medialibrary: медиа-коллекции, конверсии, responsive images (cms/content медиа).
- `.ai/skills/laravel-activitylog` — spatie/laravel-activitylog: журналирование действий (audit log в cms/auth).
- `.ai/skills/laravel-package-tools` — spatie/laravel-package-tools: каркас сервис-провайдеров пакетов `packages/cms/*`.
- `.ai/skills/laravel-deploy` — деплой и докеризация Laravel (infra/, общий Dockerfile, Octane).

Платежи и тарифы (cms/pay):
- `.ai/skills/payment-platega-integration-laravel` — эталонная интеграция платёжного шлюза Platega.io в DDD+CQRS: фабрика шлюзов, HTTP-клиент, callback, тесты. Использовать как blueprint провайдера.
- `.ai/skills/platega` — справочник API Platega.io.
- `.ai/skills/laravel-plans` — тарифные планы/подписки (rennokki/plans) — референс модели планов, опций, фич.
- `.ai/skills/moffhub-billing` — feature-based биллинг: гейтинг фич, учёт использования — референс для plan features.

Frontend:
- `.ai/skills/frontend-source-integration` — перенос экранов из готовой вёрстки как источника правды дизайна. Применять при сборке `frontends/admin` из `frontends/source-admin`.
- `.ai/skills/source-copy` — точный поблочный перенос вёрстки из reference-шаблона: ничего не добавлять, менять только тексты/пути/синтаксис.
- `.ai/skills/design-prototype` — прототипирование UI (NeuralFlow) — только если явно попросят прототип.

Прочее:
- `.ai/skills/documentation` — правила написания документации (docs/, summary).
- `.ai/skills/spatie-security` — security-гайдлайны: SSL, CSRF, хэширование, права БД. Применять при настройке окружений и ревью безопасности.
- `.ai/skills/spatie-version-control` — конвенции git: сообщения коммитов, ветки, PR.
- `.ai/skills/serp-api`, `.ai/skills/polza-ai` — интеграции SerpApi / Polza AI (транскрипция, эмбеддинги) — только при работе с соответствующими API.

Дополнительно: `.ai/AGENTS.md` — общий каталог конвенций (учитывать, что стек этого репозитория — API-сервисы без Inertia/Filament; при противоречии приоритет у `openspec/.../design.md` и этого файла).

## Команды

- `./tools/cms up|down|migrate|test [service]` — управление стеком (docker compose).
- `./tools/cms api` — сборка единого swagger из всех сервисов.
- Качество: Pint, Larastan (level 8), Pest — в каждом приложении; корневые скрипты `composer lint|stan|test`.
