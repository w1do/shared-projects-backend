# Provider Settings + Platega

## Why

У платформы нет универсальной модели настроек внешних провайдеров на проект: таблица `provider_accounts` существует, но не имеет admin API, полей статуса/URL-ов/метаданных; выбор провайдера `platega` в настройках платежей — «этикетка», за которой нет шлюза (`ProviderRegistry` знает только `manual` и `null`), а `CreatePaymentHandler` вообще не читает настройки и по умолчанию использует `manual`. Нужна единая модель настроек провайдеров (платёжные системы, токены соцсетей и прочие внешние сервисы), первый реальный шлюз — Platega, удобное заполнение в консоли и полный след платежа в ClickHouse.

## What Changes

- **Модель настроек провайдеров** — эволюция `provider_accounts` в универсальную модель: `group` (например `payments`), `label` (подпись группы/провайдера), `name` (отображаемое имя, например `Platega`), `credentials` (encrypted JSON), `properties` (JSONB: статусы ошибок провайдера, диагностика, дополнительные параметры), `project_id`, `return_url`, `fail_url`, `status` (`active`/`archived`). Уникальность `(project_id, provider)` сохраняется.
- **Admin CRUD API** в pay-service: список настроек провайдеров проекта, просмотр/upsert настроек конкретного провайдера; новые права `pay.providers.view` / `pay.providers.manage` в `PayManifest`.
- **Шлюз Platega**: `PlategaProvider` в `Infrastructure/Gateways` (создание транзакции `POST /v2/transaction/process`, заголовки `X-MerchantId`/`X-Secret`, redirect-URL, callback со статусами `CONFIRMED`/`CANCELED`/`CHARGEBACKED`), регистрация в `ProviderRegistry`.
- **Инициализация платежа по настройкам проекта**: провайдер по умолчанию берётся из `PaymentsSettings` проекта (а не хардкод `manual`), credentials/`return_url`/`fail_url` — из настроек провайдера; `redirect_url` из ответа шлюза сохраняется и возвращается в checkout-ответе. Неактивный/ненастроенный провайдер — доменная ошибка.
- **Консоль (Настройки → Платежи)**: кнопка-шестерёнка на карточке Platega открывает модальное окно с формой настроек — JSON-поля заполняются как key → value строки или вставкой сырого JSON (переключатель), поля `return_url`/`fail_url`, статус active/archive, кнопка «Скопировать с проекта» (выбор проекта → перенос всех настроек этой платёжки в форму).
- **Аналитика в ClickHouse** через `Analytics::push`: детальный след платежа по пользователю — событие `payment.initiated` при инициализации (кто, сумма, валюта, провайдер, план) и обогащённые `props` в существующих `payment.*`/`subscription.*` событиях (провайдер, план/«что получил», subscription_id, код ошибки провайдера при неуспехе).

## Capabilities

### New Capabilities

- `payments/provider-settings`: универсальная модель настроек провайдеров на проект (группы, credentials, properties, URL-ы, статус) и admin API управления ими.
- `payments/platega-gateway`: платёжный шлюз Platega — создание транзакции по настройкам проекта, redirect пользователя, обработка callback-статусов.
- `payments/payment-analytics`: детальный аналитический след платежа в ClickHouse (инициализация, результат, обогащённые атрибуты по пользователю).
- `console-payment-providers`: консольный UI настроек платёжного провайдера — шестерёнка, модальное окно, key→value/JSON-редактор, копирование настроек с другого проекта.

### Modified Capabilities

- `payments/provider-config`: список допустимых провайдеров при выборе активного больше не хардкод — валидируется по `ProviderRegistry::available()` (Platega становится реальным вариантом); инициализация платежа обязана уважать выбранного в настройках провайдера.

## Impact

- `packages/cms/pay`: миграция расширения `provider_accounts`, модель + enum статуса, CRUD-цепочка (routes/Controller/FormRequest/DTO/Command/Query/Handler/Resource), `PlategaProvider`, правки `ProviderRegistry`/`CreatePaymentHandler`/`SubscribeHandler`, listeners аналитики, `PayManifest` (права), snapshot-тесты.
- `apps/pay-service`: без изменений конфигурации settings (модель — Eloquent, не spatie-settings); swagger пересборка `./tools/cms api`.
- `packages/cms/analytics`: новые случаи в каталоге `EventType` (без изменения схемы ClickHouse — `props` свободный JSON).
- `packages/cms/contracts`: ключи локализации `PayLocalizationKeys` для новых текстов консоли.
- `frontends/admin` + `frontends/source-admin` (зеркально): `PaymentsSection.tsx`, новое модальное окно, `lib/admin/data-source/platform/pay.ts`, hooks, query keys, `console-texts.ts`.
- Безопасность: credentials возвращаются только под правом `pay.providers.manage`; хранение — существующий `encrypted:array` cast.
