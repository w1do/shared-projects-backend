# Design — refactor-ddd-cqrs-packages

## Context

См. proposal.md — Why. Проведён полный аудит `packages/cms/*`. Ключевые факты:

- **Чисто**: деньги (везде целые минорные единицы, float нет), DTO (все 40 — spatie/laravel-data, суффикс `DTO`, правильные папки), `app()`/`resolve()` в Domain/Application отсутствует.
- **Грязно**:
  - 3 контроллера с `$request->validate()`: `analytics/.../Admin/ReportsController.php:65`, `content/.../Admin/MediaController.php:28`, `auth/.../Internal/ManifestController.php:20`; плюс `Validator::make()` в `auth/.../PutSettingsHandler.php:43`.
  - `content/.../Admin/PageController.php` — персистенция (`$page->save()`) и слаг-генерация прямо в контроллере; нет `UpsertPageHandler`.
  - Раздутые классы: `auth/Application/Queries/IntrospectSubject.php` (115 строк, два публичных метода, мутация внутри Query), `auth/Application/Queries/BuildBootstrap.php` (103 строки, 5 ответственностей), `pay/Application/Handlers/ApplyPaymentStatusHandler.php` (86 строк, 4 ответственности), `RefundPaymentHandler.php` (65 строк).
  - `app()` в Presentation: `pay/.../Site/SiteSubscriptionController.php:89`, `pay/.../Webhooks/ProviderWebhookController.php:28`.
  - Ручные массивы ответов вместо DTO: `MediaController`, `MemberController`, `PasswordResetController`, `SiteAuthController`, `AuthController`, `ManifestController`, `EventsController` (analytics).
  - analytics: нет `Domain/` и ни одного DTO (queries возвращают сырые массивы); бизнес-логика (rate limit, bot filter, service-token check) в контроллерах; пустая папка `Application/Data/`.
  - Policies отсутствуют во всех пакетах; per-record проверки (system roles, ownership подписок) инлайнятся в контроллерах.
  - Сервис-провайдеры лежат в корне `src/`, а не `Infrastructure/Providers/`; пустые каталоги-огрызки (`auth/src/Actions`, `pay/src/Infrastructure/Support`, `pay/src/Domain/Events`).
  - `generators/MakeModuleCommand` скаффолдит текущие отклонения — канон нужно закрепить в стабах.

Ограничения: публичные HTTP-контракты не меняются; Pint / Larastan level 8 / Pest должны оставаться зелёными после каждого этапа.

## Goals / Non-Goals

**Goals:**
- Каждый модуль-пакет соответствует канонической four-layer структуре из CLAUDE.md.
- Тонкие контроллеры (DTO → Handler → ответ), декомпозированные Handlers/Queries (один `handle()`, одна ответственность).
- Вся HTTP-валидация — в FormRequests (`Presentation/Http/Api/V1/Requests/`), все ответы — через JsonResource (`Presentation/Http/Api/V1/Resources/`) во всех пакетах, включая analytics.
- Policies для per-record авторизации; `app()` изгнан из Presentation.
- Канон закреплён в `generators` (стабы `MakeModuleCommand`).

**Non-Goals:**
- Изменение маршрутов, форматов запросов/ответов, поведения API.
- Новые фичи, изменение схемы БД (кроме нулевых миграций нет вообще).
- Рефакторинг `apps/*`, `packages/frontend/*`, `contracts` (shared-kernel — плоская структура допустима by design).

## Decisions

1. **FormRequests + JsonResources повсеместно (решение владельца проекта).** Конвейер каждого контроллера: FormRequest (вся валидация запроса) → DTO (`fromRequest(...)` из провалидированных данных, без `rules()` в DTO) → Handler → JsonResource. FormRequests лежат в `Presentation/Http/Api/V1/Requests/<Сущность>/`, Resources — в `Presentation/Http/Api/V1/Resources/<Сущность>/`. Resource оборачивается в существующий envelope `Cms\Shared\Http\ApiResponse` (или воспроизводит его формат через `$wrap`/`with()`), чтобы JSON-контракт остался байт-в-байт прежним. Правила из существующих 40 DTO переносятся в соответствующие FormRequests; DTO остаются чистыми структурами между слоями.
2. **Декомпозиция раздутых классов — извлечением сервисов-коллабораторов, а не событийной шиной по умолчанию.** Исключение — `pay`: `ApplyPaymentStatusHandler` и `RefundPaymentHandler` декомпозируются через доменные события (`PaymentSucceeded`, `PaymentRefunded` в уже существующем пустом `pay/src/Domain/Events/`) с листенерами для ledger/subscription/analytics — жизненный цикл платежа этого явно требует. В auth извлекаем общий `AdminPermissionResolver` (дублирующийся team-id-swap в `IntrospectSubject` и `BuildBootstrap`), `IntrospectSubject` режем на `IntrospectTokenQuery` / `IntrospectApiKeyQuery`, мутацию `last_used_at` уносим в Job.
3. **Кросс-срезовая инфраструктура контроллеров — в middleware/DTO:** rate-limit и bot-filter `CollectController` → middleware; service-token check `EventsController` → существующий `ServiceToken` middleware на маршруте; introspection-plumbing (`actorId()`, `currentUser()`, `userKey()`) → общий helper/middleware в `shared`.
4. **Policies вводим точечно** — там, где сейчас per-record проверки в контроллерах: `RolePolicy` (system roles), `MemberController`/`ProjectUserController`, `SubscriptionPolicy` (ownership по `user_key`), blocked-user check из `SiteAuthController`. Route-middleware `RequirePermission` остаётся основным механизмом прав — это соответствует канону.
5. **Единый нейминг Queries — суффикс `*Query`** (как в analytics): `ListPosts` → `ListPostsQuery` и т.д. Alias-совместимость не нужна — классы внутренние.
6. **Провайдеры пакетов переносим в `Infrastructure/Providers/`**; в `pay` разводим коллизию имён: платёжные адаптеры `Infrastructure/Providers/` → `Infrastructure/Gateways/`, сервис-провайдер — в `Infrastructure/Providers/PayServiceProvider.php`. Composer `extra.laravel.providers` и autoload обновляются синхронно.
7. **analytics получает минимальный `Domain/`** (Enums для типов событий, Contracts для ClickHouse-порта — по факту использования) и полный набор DTO для 4 report-queries + `CollectEventsDTO`.
8. **`shared` и `contracts` не ломаем под four-layer** — это библиотеки, не модули. Точечно: инлайн-closure в `shared/routes/internal.php` → контроллер; `SendAnalyticsEventJob` → `Infrastructure/Jobs`-подобный namespace; в `pay` начинаем прокидывать `Money` VO в DTO/handlers вместо сырых int.
9. **Порядок работ — по пакетам, от простого к сложному** (analytics → content → auth → pay → shared/generators), каждый пакет — отдельно прогоняемый этап: Pint + Larastan + Pest зелёные перед переходом дальше.

## Risks / Trade-offs

- [Переименование namespace ломает ссылки в `apps/*` и тестах] → после каждого перемещения — глобальный grep по старому FQCN, `composer dump-autoload`, полный прогон тестов сервиса.
- [Событийная декомпозиция pay меняет порядок побочных эффектов] → листенеры синхронные (без `ShouldQueue`) на первом этапе; идемпотентность-гвард остаётся в handler; существующие Pest-тесты платежного цикла — обязательный гейт.
- [Введение Policies может незаметно изменить ответы (403 vs 404/422)] → сохранять текущие коды ответов через `ErrorEnvelope`; ассерты в тестах на конкретные статусы.
- [Больший diff → сложное ревью] → поэтапные коммиты по пакетам (Decision 9), рефакторинг без функциональных изменений в каждом коммите.
- [Перенос валидации из DTO `rules()` в FormRequests и переход на JsonResource могут изменить формат ошибок 422 и envelope ответов] → зафиксировать текущие JSON-ответы (успех и ошибки валидации) снапшот-тестами до переноса; FormRequest должен отдавать ошибки в текущем формате `ErrorEnvelope::validation`; Resource повторяет envelope `ApiResponse`.
- [Скрытая связность: cross-tenant lookup в `ProjectUserController` (запрос без видимого project-scope)] → проверить глобальные скоупы до перемещения; если это баг — зафиксировать отдельно, не чинить молча в рамках рефакторинга.

## Migration Plan

Деплой обычный — поведение не меняется. Откат — git revert поэтапных коммитов. Между этапами платформа полностью работоспособна.

## Open Questions

- Стоит ли переводить листенеры pay-событий на очереди (`ShouldQueue`) — можно решить после рефакторинга, не влияет на структуру.
