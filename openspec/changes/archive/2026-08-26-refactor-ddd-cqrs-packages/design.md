# Design — refactor-ddd-cqrs-packages

## Context

См. proposal.md — Why. Проведён повторный сплошной аудит всех девяти пакетов `packages/cms/*` (первая редакция плана охватывала только пять: auth, content, analytics, pay, shared; пакеты `ai` и `localization` в неё не попали). Актуальная картина:

**Модуль-пакеты (должны быть four-layer):** `auth` (120 файлов), `content` (57), `pay` (55), `analytics` (28), `localization` (13), `ai` (19).
**Библиотеки (four-layer не применяется):** `shared` (25), `contracts` (7), `generators` (2).

Сквозные факты по всем модуль-пакетам:

- **FormRequest — 1 на весь репозиторий** (`localization/.../Requests/UpsertTranslationRequest.php`), **JsonResource — 1** (`localization/.../Resources/TranslationResource.php`). В auth, content, pay, analytics, ai — ни одного. Валидация живёт в `rules()` 26 DTO (auth 16, content 6, pay 4), в 4 `$request->validate()` (`analytics/ReportsController:65`, `content/MediaController:28`, `auth/ManifestController:20`, `auth/TranslationsVersionController:20`), в `Validator::make` (`auth/PutSettingsHandler:43`), в `ValidationException` внутри 5 handlers (content: `ChangeStatusHandler:25`, `UpsertPostHandler:46`, `MoveCategoryHandler:34`; pay: `RefundPaymentHandler:29-35`, `SubscribeHandler:24-36`) и в ручных проверках контроллеров (`analytics/CollectController:41-44`, `analytics/EventsController:28-31`, `pay/SiteSubscriptionController:65-67`, `pay/ProviderWebhookController:24-36`, `localization/TranslationController:86-88`).
- **Policies — ноль во всём репозитории.** Каталогов `Domain/Policies/` нет ни в одном пакете; per-record проверки инлайнятся: system-roles (`auth/RoleController:48-63,79-82`), blocked+project (`auth/SiteAuthController:109-120`), ownership подписки (`pay/SiteSubscriptionController:69-70`), принадлежность роли проекту (`auth/InviteMemberHandler:21`, `AssignMemberRoleHandler:18`).
- **Сервис-провайдер в корне `src/`** у 7 пакетов из 8 (auth, content, analytics, pay, ai, shared, generators). Каноничен только `localization/src/Infrastructure/Providers/LocalizationServiceProvider.php`. В `pay` каноничное место занято платёжными адаптерами (`Infrastructure/Providers/{Manual,Null}Provider.php`, `ProviderRegistry.php`) — коллизия имён.
- **Нейминг `*Query`**: соблюдён только в analytics (4/4). Нарушен в auth (0 из 10), content (0 из 5), pay (0 из 3). В localization соблюдён (1/1).
- **`Infrastructure/Support/`** (вне канона) вместо `Persistence`/`Providers`/`Notifications` — в auth, content, analytics, pay. `Infrastructure/Notifications/` нет нигде.
- **Ручные массивы ответов** — 13+ мест в auth, `MediaController::serialize` и `ListRevisions` в content, `EventsController` и все 4 отчёта в analytics, 3 места в pay, `TranslationController::index` в localization.
- **Снапшот-тестов JSON-ответов нет ни в одном пакете** — предусловие безопасного переноса валидации/ответов сейчас не выполнено. Ни одного `assertStatus(422)` в analytics; в pay нет тестов формата `ErrorEnvelope::validation`.
- **Тесты плоские** (без Feature/Unit), обходят HTTP-конвейер через `app(Handler::class)->handle(...)` и подменяют зависимости через `app()->instance(...)` во всех пакетах.

Пакетно-специфичное (сверх первой редакции):

- **auth**: `IntrospectSubject` — 126 строк, N+1 (проект грузится 2–3 раза), мутация `last_used_at` в Query (`:62`, дублируется в `ResolveSiteProject:125`); `BuildBootstrap` — 103 строки + фасад `Cache` в Application; `PutSettingsHandler` — 70 строк, двойной проход по values; **team-id swap продублирован 5 раз** (не 2, как считалось): `IntrospectSubject:89-95`, `BuildBootstrap:50-56`, `PermissionSyncer:119-121,144-147`, `CreateProjectHandler:35-40`, `ResolveProject:81,88`; `PermissionSyncer` — 103 строки, синхронный `Project::query()->each()` по всем проектам внутри `POST /internal/manifests`; `DownstreamNotifier` — синхронный HTTP-цикл (3 URL × 2s) прямо в запросе, вызывается из 7 handlers; статические не-инъецируемые `Audit::record()` (17 вызовов), `BootstrapCache::bump()`, `Analytics::push()`; коллизия имён `Application\Commands\PublishManifestCommand` и `Console\PublishManifestCommand`; `Domain/` — только `Models` + внеканонный `Exceptions`, вместо Enums — строковые литералы (типы API-ключей, имена сервисов, системные роли, guards, ~20 кодов аудита).
- **content**: 14 повторов `find()` + `notFound()` (Post 5, Page 4, Category 3, Seo 2); `app()` в Application/Infrastructure (`UpsertCategoryHandler:34`, `PurgeContentCacheJob:15`, `RegenerateSitemapJob:23`); синхронная генерация sitemap в HTTP-запросе (`SeoFilesController:21`) при существующем `RegenerateSitemapJob`; `ListRevisions` возвращает ручные массивы прямо в ответ; `SeoDTO` — одновременно вход и выход; папка `DTOs/Content/` названа не по сущности.
- **analytics**: `Domain/` отсутствует целиком, DTO нет ни одного; маршрут `routes/internal.php:6` вообще без middleware (service-token проверяется в контроллере); `RecordEventsHandler` вызывается по одному событию за итерацию цикла в контроллере; `app()` в `ExportReportJob:23`; SQL собирается `sprintf`+`addslashes`, хотя `Connection::select()` поддерживает параметры.
- **pay**: `WebhookEvent` — единственная бизнес-модель **без `project_id` и `BelongsToProject`** (нарушение tenant-инварианта CLAUDE.md); `ProviderRegistry::for()` объявляет `$projectId`, но не использует его — отсюда хардкод `'-'` в `ProviderWebhookController:28`; `ProviderAccount` и таблица `provider_accounts` не используются нигде; в `RefundPaymentHandler:37-38` внешний вызов провайдера сделан **вне** `DB::transaction`; `Money` применяется только на границе порта, в DTO/handlers — сырые int; pay не использует общий `ProjectAwareJob`, а дублирует set/clear контекста вручную; `PaymentTransaction::boot()` объявлен `public`.
- **localization**: `UpsertTranslationDTO` импортирует `Illuminate\Foundation\Http\FormRequest` (Application → Presentation); `app(ProjectLocalesQuery::class)` внутри FormRequest; `ProjectLocalesQuery::handle(Request)` принимает HTTP-запрос в Application; `DeleteTranslationHandler::handle(Translation)` принимает Eloquent-модель без Command; `index` читает Eloquent прямо в контроллере и собирает словарь вручную; `translateMissing` принимает `ids` вообще без валидации; `TranslateMissingJob` — 174 строки; **нарушены границы пакетов**: Job и тесты импортируют `Cms\Content\Domain\Models\Category`, а миграция `0003_01_02_000000_make_category_name_translatable.php` меняет таблицу `categories` чужого пакета, при этом `cms/content` не объявлен в `localization/composer.json`; пустой `config/`.
- **ai**: HTTP-поверхности нет вообще (единственный потребитель — `localization`); **инверсия зависимости слоёв** — `Domain/Contracts/AiOperations` импортирует 10 классов из `Application/DTOs`; `LaravelAiOperations` — 261 строка, 5 ответственностей (промпты, JSON-схемы, проверка конфига, вызов SDK, маппинг ответа), внутри — мёртвый код (`$order` заполняется на `:241` и удаляется на `:257`); провайдер мутирует чужой глобальный конфиг в `boot()`; `Domain/Exceptions/` — внеканонный каталог.
- **shared**: инлайн-closure с `hash_equals` + `Cache::flush()` в `routes/internal.php:9-18`; `CachedIntrospector::forgetToken` строит ключ без суффикса проекта, который добавляется при записи (`:24` vs `:36`) — инвалидация не попадает в реальный ключ; нет интерфейсов-портов для `AuthClient`/`CachedIntrospector` (тесты наследуют конкретный класс).
- **generators**: стабы не создают `Requests/`, `Resources/`, `Infrastructure/Notifications/`; кладут провайдер в корень `src/`; создают `Infrastructure/Jobs/`; не создают `config/`; нет ни одного стаба конвейера (Controller/FormRequest/Resource/DTO/Handler/Query); `composer.json.stub` не объявляет `cms/contracts`, который использует `Manifest.php.stub`; на генератор нет тестов.

**Расхождение канон-документов:** `CLAUDE.md:32` предписывает «Валидация — rules() в DTO», а Decision 1 ниже — FormRequests. `CLAUDE.md` и `STRUCTURE.md` должны быть приведены к финальному канону в рамках этого change, иначе следующий агент воспроизведёт старое правило.

Ограничения: публичные HTTP-контракты не меняются; Pint / Larastan level 8 / Pest должны оставаться зелёными после каждого этапа.

## Goals / Non-Goals

**Goals:**
- Все шесть модуль-пакетов (auth, content, pay, analytics, localization, ai) приведены к одной и той же канонической структуре и одному и тому же конвейеру — «привести всё к одному виду» проверяется механически, а не на глаз.
- Вся HTTP-валидация — в FormRequests, все ответы — через JsonResource, во всех пакетах без исключений.
- Тонкие контроллеры (FormRequest → DTO → Handler → Resource), декомпозированные Handlers/Queries (один `handle()`, одна ответственность), единый нейминг `*Query`.
- Policies для per-record авторизации; `app()`/`resolve()`/статические фасады-сервисы изгнаны из Domain/Application/Presentation.
- Границы пакетов не нарушаются: ни один пакет не лезет в модели и таблицы другого пакета напрямую.
- Канон закреплён машинно: обновлённые стабы `MakeModuleCommand` + структурный тест-гейт, падающий при отклонении.
- `CLAUDE.md` и `STRUCTURE.md` описывают ровно тот канон, который реализован.

**Non-Goals:**
- Изменение маршрутов, форматов запросов/ответов, поведения API.
- Новые фичи и изменение схемы БД — кроме двух вынужденных структурных миграций (`payment_webhook_events.project_id`, переезд миграции `categories` из localization в content), каждая из которых выделена отдельной задачей.
- Починка найденных поведенческих багов (см. Decision 12) — они фиксируются списком, но не чинятся молча внутри рефакторинга.
- Приведение `shared`, `contracts`, `generators` к four-layer — это библиотеки.

## Decisions

1. **FormRequests + JsonResources повсеместно (решение владельца проекта).** Конвейер каждого контроллера: FormRequest (вся валидация запроса) → DTO (`fromRequest(...)` из провалидированных данных, без `rules()`) → Handler → JsonResource. FormRequests — в `Presentation/Http/Api/V1/Requests/<Сущность>/`, Resources — в `Presentation/Http/Api/V1/Resources/<Сущность>/`. Resource воспроизводит envelope `Cms\Shared\Http\ApiResponse`, чтобы JSON остался байт-в-байт прежним. `rules()` из 26 DTO переносятся в соответствующие FormRequests; DTO остаются чистыми структурами между слоями и **не импортируют `Illuminate\Http\*`** — маппинг `validated()` → DTO делает контроллер или именованный фабричный метод, принимающий `array`, а не `FormRequest` (правит текущую инверсию в `localization/UpsertTranslationDTO`).
2. **Валидация уходит из Application целиком.** `ValidationException` в handlers (content ×3, pay ×2) — это две разные вещи: правила формата запроса переезжают в FormRequest, а доменные инварианты (уникальность слага, допустимость перехода статуса, лимит суммы возврата) остаются в Application, но выражаются доменными исключениями с маппингом в тот же HTTP-код/формат через `ErrorEnvelope`. Коды и тела ответов не меняются — это фиксируется снапшот-тестами до переноса.
3. **Декомпозиция раздутых классов — извлечением сервисов-коллабораторов, а не событийной шиной по умолчанию.** Исключение — `pay`: `ApplyPaymentStatusHandler` и `RefundPaymentHandler` декомпозируются через доменные события (`PaymentSucceeded`, `PaymentRefunded` в пустом `pay/src/Domain/Events/`) с синхронными листенерами (ledger, subscription-renewal, analytics). В auth извлекается общий `AdminPermissionResolver` (**5 копий** team-id-swap), `IntrospectSubject` режется на `IntrospectTokenQuery` / `IntrospectApiKeyQuery`, мутация `last_used_at` уносится в Job.
4. **Кросс-срезовая инфраструктура контроллеров — в middleware:** rate-limit и bot-filter `analytics/CollectController` → middleware; service-token `analytics/EventsController` → `ServiceToken` middleware на `routes/internal.php` (сейчас маршрут вообще без middleware); introspection-plumbing (`actorId()` в content, `currentUser()` в auth, `userKey()` в pay) → один общий helper/middleware в `shared`.
5. **Policies вводим точечно** — там, где сейчас per-record проверки в контроллерах: `RolePolicy` (system roles), `MemberPolicy`/`ProjectUserPolicy`, `SubscriptionPolicy` (ownership по `user_key`), blocked-user check из `SiteAuthController`. Route-middleware `RequirePermission` остаётся основным механизмом прав. **Текущие коды ответов сохраняются**: где сейчас чужая запись даёт 404 (`pay/SubscriptionTest:72`), Policy обязана продолжать давать 404, а не 403.
6. **Единый нейминг Queries — суффикс `*Query`**: 18 классов переименовываются (auth 10, content 5, pay 3). Alias-совместимость не нужна — классы внутренние.
7. **Провайдеры всех пакетов — в `Infrastructure/Providers/`**; в `pay` разводится коллизия: платёжные адаптеры `Infrastructure/Providers/` → `Infrastructure/Gateways/`, сервис-провайдер — `Infrastructure/Providers/PayServiceProvider.php`. Presentation-логика из провайдера (`auth/AuthServiceProvider:39-43` — маппинг исключения в HTTP 429) переезжает в exception handler приложения. Composer `extra.laravel.providers` и autoload обновляются синхронно.
8. **analytics получает минимальный `Domain/`** (Enums типов событий, `Domain/Contracts/` с портом ClickHouse — сейчас конкретный `Connection` инжектится в 5 классов Application) и полный набор DTO для 4 report-queries + `CollectEventsDTO`.
9. **`ai` — пакет без домена, а не недоделанный модуль.** У него нет сущностей, БД и HTTP-поверхности: это адаптер к внешнему AI-провайдеру. Порт `AiOperations` переезжает из `Domain/Contracts/` в `Application/Contracts/` (он оперирует Application-DTO — так устраняется текущая инверсия Domain → Application), `Domain/` упраздняется, `Domain/Exceptions/` → `Application/Exceptions/`, реализация — в `Infrastructure/Ai/`. `LaravelAiOperations` (261 строка) разбирается на промпт-каталог, схемы ответов и маппер. Папки DTO по операциям (`GeneratePost`, `Translate`, …) вместо папок по сущностям для пакета без сущностей — допустимы, это фиксируется в каноне явно, чтобы не считалось отклонением.
10. **Границы пакетов localization ↔ content закрываются портом.** Сейчас `TranslateMissingJob` работает с `Cms\Content\Domain\Models\Category` напрямую, а миграция localization меняет таблицу `categories`, причём `cms/content` даже не объявлен в зависимостях. Решение: в localization объявляется порт `TranslatableSubjectRepository` (Domain/Contracts), адаптер для категорий реализуется в `content` и регистрируется его провайдером; миграция `name_machine`/`categories` переезжает в `content/database/migrations`; тесты категорий уезжают из `localization/tests` в `content/tests`. Зависимость `cms/content` в composer localization **не добавляется** — направление остаётся content → localization.
11. **`shared` и `contracts` не ломаем под four-layer** — это библиотеки. Точечно: инлайн-closure в `shared/routes/internal.php` → контроллер + handler; `SendAnalyticsEventJob` и `ProjectAwareJob` → `Jobs`-namespace; вводится интерфейс-порт интроспектора (сейчас тесты pay наследуют конкретный `CachedIntrospector`); `Cms\Shared\Values\Money` начинает прокидываться в DTO/handlers pay; базовый Resource, воспроизводящий envelope `ApiResponse`, живёт в `shared` и переиспользуется всеми пакетами.
12. **Поведенческие баги фиксируются, но не чинятся в этом change.** Аудит нашёл дефекты, не относящиеся к структуре: ключ инвалидации в `CachedIntrospector::forgetToken` не совпадает с ключом записи; возврат провайдеру в `RefundPaymentHandler` выполняется вне транзакции; `ProviderRegistry` игнорирует `$projectId` (и хардкод `'-'` в webhook-контроллере); `WebhookEvent` без tenant-скоупа; `ProjectUserController` без видимого project-scope; мёртвые `ProviderAccount`/`provider_accounts`; мёртвый `$order` в `LaravelAiOperations::buildTree`. Они выносятся отдельным списком (задача 9.2) — рефакторинг обязан сохранить текущее поведение, включая ошибочное, чтобы дифф оставался проверяемым.
13. **Порядок работ — сначала общий фундамент, затем пакеты по возрастанию риска:** shared-примитивы (introspection-helper, базовый Resource, findOrFail, инъецируемые Audit/BootstrapCache/DownstreamNotifier) → analytics → localization → ai → content → auth → pay → generators/финализация. Первая редакция плана шла analytics → content → auth → pay → shared, но три пакета зависят от одних и тех же shared-примитивов, поэтому shared поднимается в начало. Каждый пакет — отдельно прогоняемый этап с зелёным гейтом.
14. **Канон закрепляется машинно.** Помимо стабов генератора вводится структурный тест (архитектурный гейт), который проверяет по всем модуль-пакетам: отсутствие `$request->validate()`/`Validator::make`/`rules()` в DTO, отсутствие `app(`/`resolve(` в Domain/Application/Presentation, суффикс `*Query`, провайдер в `Infrastructure/Providers/`, наличие `Requests/`+`Resources/`, отсутствие импортов чужих пакетов. Без этого «единый вид» разъедется на следующей же фиче.

## Risks / Trade-offs

- [Перенос валидации из DTO `rules()` в FormRequests и переход на JsonResource могут изменить формат 422 и envelope] → **снапшот-тесты текущих JSON-ответов (успех + 422) пишутся первыми, до любого переноса** (задача 0.1); сейчас таких тестов нет ни в одном пакете, а в analytics нет ни одного `assertStatus(422)`.
- [Переименование namespace ломает ссылки в `apps/*` и тестах] → после каждого перемещения глобальный grep по старому FQCN, `composer dump-autoload`, полный прогон тестов сервиса.
- [Событийная декомпозиция pay меняет порядок побочных эффектов] → листенеры синхронные (без `ShouldQueue`) на первом этапе; идемпотентность-гвард остаётся в handler; полный цикл платёжных Pest-тестов — обязательный гейт.
- [Введение Policies может незаметно изменить коды ответов (403 vs 404)] → Decision 5 фиксирует сохранение текущих кодов; ассерты в тестах на конкретные статусы.
- [Разрыв связи localization → content может сломать перевод категорий] → порт вводится с адаптером и тестами до удаления прямого импорта; миграция переносится отдельным коммитом с проверкой up/down на чистой базе.
- [Две вынужденные миграции (`project_id` у webhook-событий, переезд миграции категорий) выходят за рамки «только рефакторинг»] → каждая отдельной задачей, обратимая, с проверкой отката; поведение эндпоинтов не меняется.
- [Объём вырос: 6 модуль-пакетов вместо 5, ~380 файлов] → этапность по Decision 13, поэтапные коммиты, архитектурный гейт (Decision 14) не даёт откатиться назад между этапами.
- [Тесты повсеместно обходят HTTP-конвейер (`app(Handler::class)->handle()`), поэтому не защищают контракт] → снапшот-тесты пишутся именно через HTTP-слой; переписывание остальных тестов на конвейер — не цель, но новые тесты пишутся только через него.

## Safety Protocol

Владелец поставил жёсткое ограничение: **работающее поведение не ломается**. Ограничение исполняется процедурой, а не намерением: этап без выполненного гейта не мержится. Протокол построен по результатам адверсариального анализа плана против кода (40 подтверждённых рисков, 8 критических).

Исходная слабость страховки, которую протокол компенсирует: тесты обходят HTTP-слой (`app(Handler::class)->handle()` во всех пакетах), 26 маршрутов не вызывает ни один тест, `assertExactJson`/`assertJsonStructure` — 0 совпадений по репозиторию, `QUEUE_CONNECTION=sync` и `CACHE_STORE=array` во всех `apps/*/phpunit.xml`, то есть Pest в принципе не видит класс поломок «нет воркера» и «прогретый кэш».

### Инварианты каждого шага (нарушение — блокер)

- **И1. `Optional` ≠ `null` — критический.** DTO со свойством `|Optional` строится ТОЛЬКО как `XxxDTO::from($request->validated())`. Запрещены `new self($d['x'] ?? null)` и `$validated + ['x' => $validated['x'] ?? null]`. Носители семантики: `UpsertCategoryHandler:44-49` (отсутствие ключа → `save()`, явный `null` → `saveAsRoot()` — физически разные операции над nested set: узел уезжает в корень **вместе с поддеревом**), `UpsertPostHandler:25,51-53` (перегенерация слага меняет публичный URL), `PageController:99-107`, `RefundPaymentHandler:25-27` (возврат на полную сумму вместо частичной). Панель опирается на это явно, с комментариями о прошлых инцидентах: `frontends/admin/src/lib/admin/data-source/mutations/catalog.ts:67-73`, `mutations/content.ts:37-43`.
- **И2. Контракт границы не расширяется.** Множество допустимых значений на публичном маршруте может только сузиться. `{action}` — это ТРИ разных множества, а не дубль: `routes/public.php:17` (без ограничения), `routes/admin.php:22` (4 значения с `delete`), `SiteSubscriptionController:65` (3 значения). Сведение в один Enum откроет пользователю сайта удаление подписки.
- **И3. Ответы без конверта остаются без конверта.** Базовый Resource из 1.1 не применяется к `/internal/introspect` (`IntrospectController:22`), `/webhooks/{provider}` (`ProviderWebhookController:42`), `/internal/cache-bust` (closure). Для introspect это критично: `IntrospectionResult::fromArray` на любое отклонение отвечает не исключением, а `active=false`, и `CachedIntrospector` кэширует это на `min(15, ttl)` секунд — авторизация во всех downstream-сервисах отключается тихо.
- **И4. Money — только внутрь.** `Money::jsonSerialize()` отдаёт вложенный объект; выходные DTO (`PaymentDTO:15-16`, `PlanDTO:20`) остаются `int` minor units.
- **И5. Форма списка не меняется.** «Выравнивание контракта» queries = только суффикс `*Query` и DTO вместо Eloquent. `ListPlans` остаётся непагинированной коллекцией **без** `meta`; `ListPayments`/`ListSubscriptions` — `CursorPaginator` с `meta`.
- **И6. Источник данных запроса не меняется.** `ReportsController:63-74` валидирует всё тело (`all()`), но читает даты только из query-string — обе половины поведения сохраняются: FormRequest продолжает валидировать `all()` (иначе 422 на невалидное тело превратится в 202 — п. Б1), а DTO строится из `$request->query()`. Буквальное `validationData() => query()` из ранней редакции этого пункта — доказанная ошибка (ловится guard-тестом 0.9).
- **И7. Route-параметры не валидируются через FormRequest.** `{action}` не попадает в `$request->all()`; ограничение — `->whereIn(...)` на маршруте.
- **И8. Границу транзакции и порядок эффектов не двигать.** `ApplyPaymentStatusHandler:25-27` — гвард идемпотентности ДО транзакции, остальное внутри одной. Листенеры pay синхронные: `ShouldQueue`/`afterCommit` запрещены.
- **И9. Побочный эффект переносится в очередь только при наличии потребителя.** В `infra/compose/compose.yaml` воркер ровно один — `content-worker`. До появления воркеров auth/pay/analytics `Audit::record`, `PermissionSyncer::syncSystemRoles`, `BootstrapCache::bump` остаются синхронными (инъекция ≠ перенос в очередь).
- **И10. `forgetCachedPermissions()` — не часть team-id-swap.** При извлечении `AdminPermissionResolver` вызовы `PermissionSyncer:30,65` сохраняются: в проде store прав — redis с TTL 24 ч, потеря вызова даёт 403 у операторов на сутки при внешне успешном ответе 200.
- **И11. Ownership-условие в lookup не заменяется на `findOrFail`.** Составные условия (`->members()->whereKey`, `where('user_key', ...)`) сохраняются; чужая запись обязана давать 404, а не 403.
- **И12. Форма закэшированного значения меняется только вместе с ключом.** Ключи `bootstrap:{admin}:{project}:{version}` и `content:{project}:v{version}:{key}` переживают деплой; при смене формы значения в тот же коммит вносится версия схемы в префикс (`bootstrap:s2:`).
- **И13. FQCN очередных задач.** Класс, чей FQCN сериализуется в payload очереди, переименовывается только после дренажа очередей или с `class_alias` на релиз. `ProjectAwareJob` переименовывается свободно — в payload лежит наследник.
- **И14. Имена файлов миграций неприкосновенны.** Перенос миграции = смена каталога без переименования: Laravel хранит в `migrations` имя без пути, переименование даёт повторный `up()` отдельным batch'ем, а ближайший `migrate:rollback` выполнит разрушительный `down()` (дроп `name_machine`, схлопывание JSON).
- **И15. Пакеты content/analytics/pay не видят `Cms\Auth\*`.** Общие middleware живут в `shared`; сейчас `grep -rn 'Cms\\Auth' packages/cms/{shared,analytics,content,pay}` = 0 и обязан остаться 0. Отсюда: `ServiceToken` для задач 1.5/2.5 создаётся в `shared`, класс из `cms/auth` не переиспользуется.
- **И16. Валидация батча — поэлементная.** Отбраковка отдельных элементов остаётся в handler со счётчиком `accepted`; FormRequest валидирует ТОЛЬКО конверт (`events` — массив 1..100) и не объявляет НИКАКИХ правил `events.*` — правило вида `events.*.currency` заставило бы Laravel вырезать из `validated()` все не перечисленные поля событий и молча уничтожило бы батч (доказано на живом валидаторе). Enum типов событий — справочник, применять как `Rule::in` на приёме запрещено (имена собираются в рантайме).
- **И17. Батч не схлопывается по тенанту.** `project_id`/`source` в `POST /internal/events` — per-event; batch-обработка допустима только группировкой по паре `(project_id, source)`.

### Гейт перед мержем каждого этапа

1. `composer lint && composer stan && composer test` зелёные во **всех четырёх** приложениях, не только в затронутом. Замер baseline на старте change: `lint` — зелёный; `test` — зелёный (161 тест / 478 проверок до написания снимков, 560 / 958 после); `stan` — **красный, 2 предсуществующие ошибки** в `BuildBootstrap:99` и `IntrospectSubject:124`, снимаются задачей 0.15. Учесть, что `composer stan|test` идут циклом `for d in apps/*` с выходом по первой ошибке — упавший ранний сервис маскирует состояние последующих.
2. Все характеризационные снимки зелёные **без единой правки ожиданий**. Правка ожидания = изменение контракта: требует записи в раздел «поведение, которое обязано остаться прежним» или явного отступления в proposal.
3. Ни один тест не удалён и не ослаблен: в `git diff` по `**/tests/**` нет удалённых `assert*` без более сильной замены.
4. Прогон на поднятом стеке: `./tools/cms up` + `tools/smoke.sh` целиком — единственная проверка, идущая через gateway с реальным auth (тесты content/analytics/pay работают через фейк-интроспектор).
5. Для этапов с очередями/эффектами: `php artisan queue:failed` пусто во всех приложениях; `redis-cli --scan --pattern 'queues:*'` + `LLEN` = 0.
6. Для этапов с провайдерами: `composer dump-autoload` + `grep` старого FQCN по `apps/*/bootstrap/cache/packages.php`, `composer.lock`, `packages/cms/*/composer.json` = 0.
7. Для этапов с миграциями: `migrate --pretend` на боевой/стейджевой базе не содержит переносимой миграции; накат/откат на чистой базе.

### Порядок выкатки

1. **Дренаж очередей — до переименования любого очередного класса** (1.6), включая `queues:webhooks` и `queues:critical`.
2. **Самолечение манифеста пакетов — до этапа 1.** `compose.yaml` монтирует `.:/var/www` поверх образа, entrypoint идёт с `--no-scripts` и не делает `package:discover` — контейнер читает хостовый `bootstrap/cache/packages.php`. Одна строка `rm -f bootstrap/cache/{packages,services}.php` в entrypoint снимает риск для всех семи переносов провайдеров.
3. **Воркеры очередей auth/pay/analytics — до этапа 6** (задача 6.0).
4. **auth выкатывается раньше downstream** при любой правке `/internal/introspect`; откат требует работающего `/internal/cache-bust`.
5. **Коммит, меняющий форму кэшируемого значения, содержит смену префикса ключа** (И12).
6. **7.9 блокируется 9.2**: источника `project_id` для вебхука сегодня нет. Порядок: 9.2 → 7.9-A (nullable-колонка + бэкфилл) → 7.9-B (трейт).

### Поведение, которое обязано остаться прежним, даже если выглядит как баг

Изменение любого пункта без записи в proposal — регрессия, а не улучшение.

1. `POST /analytics/export` **игнорирует** `from`/`to` из тела и читает их из query-string, валидируя при этом тело. Дефолтное окно `[now-30d; now]`.
2. `/internal/introspect`, `/webhooks/{provider}`, `/internal/cache-bust` отдают плоский JSON **без конверта `data`**.
3. Site-пользователю доступны ровно `cancel|resume|pause`; `delete` — только оператору. Неизвестное действие на site → 422 с `error.details.action.0 = 'Unknown action.'`.
4. `PUT /content/translations/{id}` **игнорирует** присланный `key` и берёт ключ найденной по id записи: это update, а не create.
5. Событие без `project_id` и событие с именем вне `^[a-z0-9_.]+$` **молча пропускаются**, ответ остаётся 202 с фактическим `accepted`; `currency: null` гасится в `''`, а не даёт 422.
6. «Ключ отсутствует» ≠ «ключ = null» во всех Upsert (`parent_id`, `slug`, `body`, `locale`, `categories`, `amount_minor`): частичный PUT не трогает непереданные поля и не перемещает узел дерева.
7. `WebhookEvent` — без tenant-скоупа, `project_id` вебхука хардкожен как `'-'`, поиск платежа идёт через `Payment::acrossProjects()`.
8. `GET /pay/plans` — `{data:[...]}` без `meta`; site `GET /pay/subscriptions` (mine) — тоже коллекция **без** `meta`; админские `GET /pay/payments` и `GET /pay/subscriptions` — курсорные с `meta`.
9. `GET /sitemap.xml` при отсутствии артефакта генерирует карту синхронно — на холодном старте ответ непустой.
10. Денежные поля на границе API — целые minor units.
11. Кросс-проектный доступ к чужой записи даёт 404, а не 403.

## Migration Plan

Деплой обычный — поведение не меняется. Откат — git revert поэтапных коммитов. Между этапами платформа полностью работоспособна. Две структурные миграции (`payment_webhook_events.project_id`, переезд миграции категорий) накатываются и откатываются на чистой базе до включения в общий прогон.

## Open Questions

- Стоит ли переводить листенеры pay-событий на очереди (`ShouldQueue`) — решается после рефакторинга, на структуру не влияет.
- `DownstreamNotifier` (синхронный HTTP из 7 handlers auth) переводить в Job в рамках этого change или отдельно — задача 6.9 предполагает Job; если это меняет наблюдаемую задержку кэш-инвалидации у потребителей, решение переносится в follow-up.
