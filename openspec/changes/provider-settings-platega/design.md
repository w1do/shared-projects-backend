# Design — Provider Settings + Platega

## Context

Мотивация — в `proposal.md` (Why). Текущее состояние, определяющее подход:

- В `packages/cms/pay` уже есть таблица `provider_accounts` (`project_id`, `provider`, `credentials encrypted:array`, `enabled`, unique `(project_id, provider)`) и модель `Domain/Models/ProviderAccount`, но нет ни одного admin-эндпоинта для неё.
- `Infrastructure/Gateways/ProviderRegistry` — точка расширения: `PROVIDERS = ['manual', 'null']`, метод `for(projectId, provider)` резолвит `ProviderAccount` и вызывает `configure($account->credentials ?? [])`; константа `WITHOUT_PROJECT = '-'` для фазы webhook без контекста проекта.
- Контракт `Domain/Contracts/PaymentProvider`: `key/configure/createPayment/refund/verifyWebhook/parseWebhook`. `createPayment()` возвращает `redirect_url`, но `CreatePaymentHandler` его отбрасывает; провайдер по умолчанию — хардкод `'manual'`, `PaymentsSettings` не читается.
- `UpdatePaymentsSettingsRequest` содержит хардкод `'platega'` в `Rule::in` — «этикетка» без шлюза.
- Аналитика: `Analytics::push(string $key, string|array $history, ?string $projectId)` → HTTP → analytics-service → Redis-буфер → ClickHouse `events` (`props` — свободный JSON, схему менять не нужно). Синхронные listeners `PushPaymentStatusEvent`/`PushPaymentRefundEvent` уже шлют `payment.succeeded`/`payment.{status}`/`payment.refunded` (И8: listeners не `ShouldQueue`).
- Консоль: карточка Platega — `frontends/{admin,source-admin}/src/components/pages/settings/sections/PaymentsSection.tsx`; API-слой `lib/admin/data-source/platform/pay.ts`; `{project}` в путях подставляется из cookie `project_key`; список проектов есть в bootstrap. Готового key→value/JSON-редактора в консоли нет. Обе директории фронта правятся зеркально (байт-в-байт для общих файлов).
- Blueprint интеграции Platega: `.ai/skills/payment-platega-integration-laravel` + справочник API `.ai/skills/platega` (заголовки `X-MerchantId`/`X-Secret`, `POST /v2/transaction/process`, статусы `CONFIRMED`/`CANCELED`/`CHARGEBACKED`, `hash_equals` для callback, наружу — десятичные суммы, внутри — минорные единицы).
- Ограничения ArchitectureGateTest: валидация только в FormRequests; без `app()/resolve()` в Domain/Application/Presentation; `*Query`-суффикс; без кросс-пакетных импортов Domain-моделей; DTO — `spatie/laravel-data` с суффиксом `DTO`.

## Goals / Non-Goals

**Goals:**
- Превратить `provider_accounts` в универсальную модель настроек провайдеров с admin API — без параллельной новой таблицы.
- Первый реальный шлюз (Platega), подключённый через существующий `ProviderRegistry` и существующий webhook-конвейер.
- Инициализация платежа по настройкам проекта (провайдер из `PaymentsSettings`, credentials/URL-ы из настроек провайдера).
- Полный аналитический след платежа без изменений схемы ClickHouse.
- Консольная форма с key→value/JSON-редактором и копированием с проекта — из существующих примитивов вёрстки.

**Non-Goals:**
- UI и API для других групп провайдеров (соцсети и т.п.) — модель и схема готовы (`group`), но экран делается только для payments.
- Вынос модели в отдельный общий пакет: другие сервисы при необходимости повторяют схему у себя (как это уже сделано с таблицей `settings` per-service); кросс-пакетные импорты Domain-моделей запрещены гейтом.
- Инициация возвратов через Platega из админки сверх существующего `refund`-конвейера.
- Изменение схемы ClickHouse и агрегатов (props — свободный JSON).

## Decisions

### D1. Модель = расширение `provider_accounts`, не новая таблица
Добавляем колонки: `group` (string, default `payments`), `label` (string, nullable), `name` (string, nullable), `properties` (jsonb, nullable), `return_url` (string, nullable), `fail_url` (string, nullable), `status` (string: `active`/`archived`, backfill из `enabled`, затем `enabled` удаляется). Модель `ProviderAccount` остаётся (имя не меняем: её уже знает `ProviderRegistry` и тесты; «аккаунт провайдера» и есть его настройки), добавляется enum `Domain/Enums/ProviderStatus` с методом `isActive()`.
*Альтернативы*: новая таблица `provider_settings` (+ перенос) — churn без выгоды; держать `enabled` рядом со `status` — два источника истины, отклонено.

### D2. Каталог провайдеров задаёт метаданные по умолчанию
`group`/`label`/`name` — презентационные атрибуты; их дефолты для известных провайдеров описываются статическим каталогом в pay-пакете (`platega` → `payments` / «Платёжные системы» / «Platega») и подставляются в upsert-handler'е, если не переданы. Валидация ключа `provider` — по `ProviderRegistry::available()`.

### D3. Admin API — три эндпоинта в pay-service
```
GET /api/admin/v1/projects/{project}/pay/providers               pay.providers.view
GET /api/admin/v1/projects/{project}/pay/providers/{provider}    pay.providers.manage
PUT /api/admin/v1/projects/{project}/pay/providers/{provider}    pay.providers.manage
```
Каноническая цепочка: FormRequest → DTO (`Application/DTOs/ProviderAccount/UpsertProviderAccountDTO`) → Command/Query (`UpsertProviderAccountCommand`, `GetProviderAccountQuery`, `ListProviderAccountsQuery`) → Handler → Resource. Список отдаёт метаданные + `has_credentials` (bool), но не значения credentials; show под `pay.providers.manage` отдаёт расшифрованные credentials/properties — это нужно и форме редактирования, и копированию между проектами. Show по ненастроенному провайдеру возвращает пустую заготовку (дефолты каталога, статус `active`, пустые JSON-поля), не 404. Права объявляются в `PayManifest` (`PermissionDefinition`, группа `settings`) и публикуются `manifest:publish`.

### D4. Настройки передаются шлюзу типизированно
Меняем контракт `PaymentProvider::configure(array $credentials)` → `configure(GatewayConfig $config): static`, где `Domain/ValueObjects/GatewayConfig` = `{credentials: array, returnUrl: ?string, failUrl: ?string, properties: array}`. `ProviderRegistry::for()` строит VO из `ProviderAccount` и требует `status = active` (иначе доменная ошибка «провайдер не настроен/неактивен»). `ManualProvider`/`NullProvider` обновляются тривиально (no-op).
*Альтернативы*: подмешивать URL-ы в массив credentials — конфляция секретов и настроек; передавать Eloquent-модель — связывает контракт Domain с persistence-жизненным циклом, отклонено.

### D5. `PlategaProvider` — по blueprint-скиллу
`Infrastructure/Gateways/PlategaProvider.php`, HTTP-клиент Laravel (таймауты, `base_url` из конфига `cms-pay` — переопределяемо в тестах через `Http::fake`). `createPayment`: `POST /v2/transaction/process` с `X-MerchantId`/`X-Secret` из credentials, суммой в десятичном виде (конверсия из минорных единиц только на границе, через `Money`), `return_url`/`fail_url` из `GatewayConfig`; ответ → `{external_id, redirect_url, status}`. Маппинг статусов Platega → `PaymentStatus`: `CONFIRMED` → succeeded, `CANCELED` → canceled, `CHARGEBACKED` → refunded. Регистрация: `'platega' => PlategaProvider::class` в `ProviderRegistry::PROVIDERS`, после чего хардкод в `UpdatePaymentsSettingsRequest` заменяется на `Rule::in(ProviderRegistry::available())`.

### D6. Webhook — двухфазная верификация
На фазе приёма (`POST /webhooks/platega`, адаптер без контекста проекта — `WITHOUT_PROJECT`) `verifyWebhook` проверяет только форму запроса (наличие идентификатора транзакции и статуса). Проверка подлинности секрета (`hash_equals` заголовков против credentials проекта) выполняется в существующем конвейере обработки (`ProcessWebhookEventJob` → применение статуса) после резолва платежа по `provider_ref` → `project_id` → настроенный адаптер; невалидный секрет — событие отклоняется до применения статуса. Идемпотентность — существующий механизм `payment_webhook_events`.

### D7. Провайдер по умолчанию и redirect_url
`CreatePaymentHandler`: провайдер = явный из DTO, иначе `PaymentsSettings->provider` проекта (конструкторная инъекция настроек, без `app()`); `redirect_url` из ответа шлюза сохраняется в новую nullable-колонку `payments.redirect_url` и прокидывается в checkout-ответ (`SubscribeHandler` → DTO/Resource подписки). Ошибка создания транзакции: платёж помечается failed, в `properties` настроек провайдера пишется `last_error = {code, message, occurred_at, payment_id}` (обновление модели в Handler; объект компактный, перетирается последней ошибкой), плюс аналитическое событие с ошибкой.

### D8. Аналитика — обогащение существующего конвейера
- Новое событие `payment.initiated` пушится в `CreatePaymentHandler` после создания платежа: subject = `user_key`, `value_minor`, `currency`, props `{payment_id, provider, plan_id, plan_name, subscription_id}`.
- Существующие listeners `PushPaymentStatusEvent`/`PushPaymentRefundEvent` обогащаются теми же props + `error` (код/статус провайдера) при неуспехе; остаются синхронными (И8).
- В каталог `EventType` (analytics) добавляются случаи `payment.initiated`, `payment.failed`, `payment.canceled` — каталог, не валидация (И16). Схема ClickHouse не меняется.

### D9. Консоль: копирование с проекта — на фронте, не на бэке
«Скопировать с проекта» = GET настроек провайдера проекта-источника тем же show-эндпоинтом (путь строится с явным ключом проекта-источника, минуя подстановку `{project}` из cookie) → значения подставляются в форму → сохранение обычным PUT текущего проекта. Права на проект-источник проверяет штатный `AuthorizeOperator` по сегменту `{project}` — серверной кросс-проектной логики не нужно. Список проектов — из bootstrap.
*Альтернатива*: серверный copy-эндпоинт — потребовал бы ручной проверки права на второй проект внутри handler'а, дублируя middleware; отклонено.

### D10. Key→value/JSON-редактор — новый переиспользуемый компонент
`KeyValueJsonEditor`: источник истины — JS-объект; режим «строки ключ→значение» (добавить/удалить строку; вложенные значения показываются JSON-строкой) и режим «сырой JSON» (textarea с валидацией при переключении/сохранении). Собирается из существующих примитивов (`ui/inputs`, `ui/overlay/dialog`); модальное окно — по образцу `promotion-form-modal`. Новые функции в `platform/pay.ts` (`getPaymentProviders`, `getPaymentProvider`, `getPaymentProviderFromProject`, `updatePaymentProvider`), hooks + query keys, тексты — в `console-texts.ts` обеих директорий и `PayLocalizationKeys`. Обе директории фронта правятся зеркально.

## Risks / Trade-offs

- [Show-эндпоинт отдаёт расшифрованные credentials] → только под `pay.providers.manage`; в list credentials нет вовсе; at-rest — существующий `encrypted:array`; фронт не пишет значения в логи/URL.
- [Platega недоступна или отвечает ошибкой при создании транзакции] → таймауты HTTP-клиента, платёж помечается failed без ретраев на горячем пути, ошибка фиксируется в `properties.last_error` и аналитике; тесты на `Http::fake`.
- [Callback приходит без контекста проекта] → двухфазная верификация (D6): статус не применяется без совпадения секрета; повторные callback гасятся идемпотентностью `payment_webhook_events`.
- [Изменение сигнатуры `configure()` — контрактная правка] → внутренняя для пакета pay; `Manual`/`Null` тривиальны; характеризационные тесты обновляются в этом же изменении.
- [Рассинхрон `frontends/admin` ↔ `frontends/source-admin`] → все правки парно, финальная проверка diff общих файлов.
- [Дрейф метаданных `group`/`label`/`name` в БД] → дефолты подставляются из каталога при upsert; поля презентационные и не участвуют в логике платежей.

## Migration Plan

1. Аддитивная миграция pay: новые колонки `provider_accounts` (+ backfill `status` из `enabled`, затем drop `enabled`); новая колонка `payments.redirect_url`. `down()` зеркально откатывает.
2. `manifest:publish` — новые права `pay.providers.view`/`pay.providers.manage` (роль `super-admin` покрыта `Gate::before`).
3. Пересборка swagger `./tools/cms api`; рестарт `admin-front` (бандл собирается при старте контейнера).
4. Откат: revert кода + `migrate:rollback` последней миграции pay; данные настроек при откате колонок теряются только в новых полях.

## Open Questions

- Точный состав необязательных параметров Platega (например, идентификатор способа оплаты `paymentMethod`) — задаётся через `credentials`/`properties` по справочнику `.ai/skills/platega` на этапе реализации; на спеки и разбивку задач не влияет.
