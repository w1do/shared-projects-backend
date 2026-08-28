# Tasks — Provider Settings + Platega

## 1. Модель настроек провайдеров (pay)

- [x] 1.1 Миграция расширения `provider_accounts`: добавить `group` (default `payments`), `label`, `name`, `properties` (jsonb), `return_url`, `fail_url`, `status` (backfill из `enabled` → `active`/`archived`, затем drop `enabled`); `down()` зеркален; verify: `./tools/cms migrate pay` проходит, повторный запуск идемпотентен
- [x] 1.2 Enum `Domain/Enums/ProviderStatus` (`Active`/`Archived`, метод `isActive()`), обновить `ProviderAccount`: fillable/casts новых полей (`properties` array, `status` enum), убрать `enabled`; verify: юнит-тест модели на casts и уникальность `(project_id, provider)` зелёный
- [x] 1.3 Каталог метаданных провайдеров (D2: `platega` → group `payments`, label «Платёжные системы», name `Platega`) и VO `Domain/ValueObjects/GatewayConfig` (credentials, returnUrl, failUrl, properties); verify: юнит-тесты на подстановку дефолтов каталога и сборку VO

## 2. Admin API настроек провайдеров

- [x] 2.1 Права `pay.providers.view`/`pay.providers.manage` в `PayManifest` (группа settings); verify: `manifest:publish` выводит новые права, маршруты под ними отвечают 403 без права
- [x] 2.2 CRUD-цепочка: routes (`GET providers`, `GET/PUT providers/{provider}`), `ProviderAccountsController` (+ `#[OA]`), FormRequest upsert (валидация: provider ∈ `ProviderRegistry::available()`, status enum, URL-ы, credentials/properties — объекты), `Application/DTOs/ProviderAccount/UpsertProviderAccountDTO`, Command/Queries (`*Query`-суффикс), Handlers (upsert подставляет дефолты каталога), Resources (list без credentials + `has_credentials`; show — полные данные; show ненастроенного — пустая заготовка, не 404); verify: Pest feature-тесты на все сценарии спеки `payments/provider-settings`
- [x] 2.3 Snapshot-тесты контракта (Characterization) для list/show/upsert + пересборка swagger; verify: `./tools/cms test pay` и `./tools/cms api` проходят, снапшоты закоммичены

## 3. Шлюз Platega

- [x] 3.1 Контракт `PaymentProvider::configure(GatewayConfig)`: обновить интерфейс, `ManualProvider`, `NullProvider`, `ProviderRegistry::for()` (строит VO, требует `status = active`, иначе доменная ошибка «провайдер не настроен/неактивен»); verify: существующие тесты pay зелёные после правки
- [x] 3.2 `Infrastructure/Gateways/PlategaProvider` по `.ai/skills/payment-platega-integration-laravel` + `.ai/skills/platega`: `createPayment` (`POST /v2/transaction/process`, `X-MerchantId`/`X-Secret`, минорные единицы → десятичные через `Money`, `return_url`/`fail_url` из VO, ответ → external_id/redirect_url/status), `refund`, маппинг `CONFIRMED`/`CANCELED`/`CHARGEBACKED` → `PaymentStatus`, `base_url` в конфиге `cms-pay`; регистрация `'platega'` в `ProviderRegistry::PROVIDERS`; verify: юнит-тесты на `Http::fake` — успех, ошибка API, маппинг статусов
- [x] 3.3 Заменить хардкод `'platega'` в `UpdatePaymentsSettingsRequest` на `Rule::in(ProviderRegistry::available())`; verify: тест — сохранение неизвестного провайдера даёт ошибку валидации, `platega` принимается

## 4. Инициализация платежа по настройкам проекта

- [x] 4.1 `CreatePaymentHandler`: провайдер = явный из DTO, иначе `PaymentsSettings->provider` (конструкторная инъекция); миграция `payments.redirect_url` (nullable), сохранение `redirect_url` из ответа шлюза; verify: feature-тест — платёж без явного провайдера идёт через провайдера из настроек, `redirect_url` сохранён
- [x] 4.2 Прокинуть `redirect_url` в checkout-ответ подписки (`SubscribeHandler` → DTO/Resource); verify: snapshot checkout-ответа содержит `redirect_url` при redirect-шлюзе
- [x] 4.3 Фиксация ошибки провайдера: при ошибке создания транзакции платёж → failed, `properties.last_error = {code, message, occurred_at, payment_id}` в настройках провайдера; verify: тест с `Http::fake` ошибки — статус, `last_error` и отсутствие внешней транзакции

## 5. Webhook Platega

- [x] 5.1 `verifyWebhook`/`parseWebhook` в `PlategaProvider` + поддержка в `ProviderWebhookGateway`: на фазе приёма — проверка формы payload; в конвейере обработки — `hash_equals` секрета против credentials проекта после резолва платежа по `provider_ref` (D6), невалидный секрет — отклонение до применения статуса; verify: feature-тесты — `CONFIRMED` активирует подписку, неверный секрет отклоняется, повторный callback идемпотентен (`payment_webhook_events`)

## 6. Аналитика платежей

- [x] 6.1 Событие `payment.initiated` в `CreatePaymentHandler` (subject `user_key`, `value_minor`, `currency`, props `{payment_id, provider, plan_id, plan_name, subscription_id}`); verify: тест через фейковый `AnalyticsRecorder` проверяет payload события
- [x] 6.2 Обогатить `PushPaymentStatusEvent`/`PushPaymentRefundEvent` props: provider, план, subscription_id, `error` при неуспехе; listeners остаются синхронными; verify: тесты payload для succeeded/failed/refunded
- [x] 6.3 Добавить в каталог `EventType` (analytics) случаи `payment.initiated`, `payment.failed`, `payment.canceled` (каталог, не `Rule::in`); verify: `./tools/cms test analytics` зелёный
- [x] 6.4 Интеграционная проверка следа: цепочка initiated → succeeded → refunded по одному пользователю даёт события с общим `payment_id` и одним subject key; verify: feature-тест на последовательность событий рекордера

## 7. Консоль — API-слой

- [x] 7.1 `platform/pay.ts`: типы и функции `getPaymentProviders`, `getPaymentProvider`, `getPaymentProviderFromProject(projectKey, provider)` (путь с явным ключом проекта-источника), `updatePaymentProvider`; hooks + query keys (`adminQueryKeys.settings.*`); verify: node-тесты слоя данных (относительные `.ts`-импорты) зелёные
- [x] 7.2 Тексты: ключи `console.settings.payments.provider.*` в `console-texts.ts` обеих директорий + зеркало в `PayLocalizationKeys`; verify: строки в компонентах только через `t()`, поиск литералов пуст

## 8. Консоль — UI

- [x] 8.1 Компонент `KeyValueJsonEditor` (режимы «ключ → значение» и raw JSON, синхронизация режимов, валидация JSON блокирует сохранение) из существующих примитивов `ui/inputs`; verify: ручная проверка сценариев спеки `console-payment-providers` (ввод пар, вставка JSON, невалидный JSON)
- [x] 8.2 Модальное окно настроек провайдера (по образцу `promotion-form-modal`): credentials/properties через `KeyValueJsonEditor`, поля `return_url`/`fail_url`, переключатель статуса active/archive, кнопка «Скопировать с проекта» (выбор проекта из bootstrap → GET источника → подстановка в форму без автосохранения); шестерёнка на карточке Platega в `PaymentsSection.tsx`; verify: сценарии — открытие с предзаполнением, сохранение, копирование + явное сохранение
- [x] 8.3 Зеркалирование: все правки парно в `frontends/admin` и `frontends/source-admin`; verify: `diff` общих изменённых файлов пуст
- [x] 8.4 Пересборка фронта: рестарт `admin-front` и дождаться «Ready»; verify: в консоли шестерёнка работает против живого API (заполнение, сохранение, копирование с проекта)

## 9. Качество и интеграция

- [x] 9.1 Полный прогон качества: `composer lint`, `composer stan` (level 8), `./tools/cms test pay` + `./tools/cms test analytics`, `./tools/refactor-inventory.sh --strict` и ArchitectureGateTest; verify: всё зелёное
- [x] 9.2 Сквозной сценарий на dev-стеке: настроить Platega через модалку → оформить подписку → получить `redirect_url` → сымитировать callback `CONFIRMED` → проверить статус платежа/подписки и события в ClickHouse; verify: каждая точка цепочки наблюдаема (API-ответы, таблица `events`)
