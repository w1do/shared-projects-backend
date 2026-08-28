# Design: licensing-and-polymorphic-subscriptions

## Context

Мотивация — см. proposal.md «Why». Состояние, влияющее на подход (по инвентаризации кода):

- Четыре Laravel-приложения; коммерческий домен — `apps/pay-service`; пакеты монтируются composer + сервис-провайдер, маршруты — файлы `routes/*.php` пакета.
- **Подписки сегодня**: `subscriptions.user_key` — varchar(128), формат-контракт `user:{projectId}:{userId}` (VO `SiteUserKey`, порождается `Cms\Shared\AuthClient\RequestIntrospection::siteUserKey()` из `X-User-Token`); `plan_id` — настоящий FK на `plans`. Пользователи сайтов живут в БД **auth-service** — локальной таблицы пользователей в pay-service нет, поэтому строковый ключ и был выбран. Владение = `where user_key` (чужая подписка → 404, не 403). Анти-дубль: одна живая подписка (active|past_due|paused) на пару (user_key, plan_id).
- **Renewal-цикл**: `RenewDueSubscriptionsJob` (hourly) → `RenewSubscriptionHandler` (цена `plan->price()`, описание `Renewal {plan->code}`, идемпотентность `sub:{id}:renew:{Ymd}`) → платёж → листенер `ExtendSubscriptionPeriod` на `PaymentSucceeded` двигает `current_period_ends_at` на `plan->periodInterval()` (сдвиг от прежнего конца, если он в будущем, иначе от now() — guard 0.7). Известный дефект: переход `past_due → past_due` запрещён enum'ом, повторное неуспешное продление бросает ValidationException и рвёт ретраи, хотя спека требует повторных попыток.
- **Событий подписки не существует** — только платёжные (`PaymentSucceeded` и др., синхронные, порядок листенеров фиксирован И8); жизненный цикл подписки уходит строками в `Analytics::push(user_key, 'subscription.*')`.
- **Аналитика**: `payments.user_key` (денормализованная копия) — субъект событий `payment.*`; ClickHouse склеивает историю по точному равенству `subject_key`; `auth/User::subjectKey()` выдаёт тот же формат `user:{project}:{id}` — корреляция auth- и pay-событий держится на байтовом совпадении строк. `Analytics::push` выводит `project_id` парсингом префикса `user:`. `PlategaProvider` шлёт `payment.user_key` во внешний антифрод (`metadata.userId`).
- **Wire-контракты**: `SubscriptionResource {id, user_key, status, grants_access, current_period_ends_at, plan}` и `PaymentResource` (c `user_key`, `subscription_id`) закреплены 19 JSON-снимками ключ-в-ключ (`user_key` не маскируется); фабрик Subscription/Payment нет — фикстуры сырыми `Model::create` в 9 файлах. Внешние потребители: только `tools/smoke.sh` (не читает `user_key`); фронтенды подписки не используют. Тестовый контур pay-service гоняет миграции на sqlite `:memory:` (phpunit.xml), прод — Postgres: бэкфилл обязан быть портируемым между драйверами.
- **Зависимости пакетов**: `cms/contracts` — нижний слой (только illuminate/support), `cms/shared` зависит от contracts, модули — от обоих. `Money` живёт в shared. Канон four-layer закреплён `ArchitectureGateTest::modulePackages()` (жёсткий список) и `tools/refactor-inventory.sh` (`MODULES=`).
- Права публикуются через `PayManifest` (`PermissionDefinition`); teams-режим spatie/laravel-permission. PHP `^8.3` (runtime-образ `phpswoole/swoole:php8.4`) с ext-sodium из базового образа.

## Goals / Non-Goals

**Goals:**

- Полиморфные подписки: подписчик и предмет — расширяемые пары type+id; site-пользователи и тарифные планы продолжают работать, организации и лицензионные планы подключаются без изменения схемы.
- Непрерывность аналитики: subject-ключи site-пользователей байт-в-байт прежние.
- Отдельный модуль-пакет `packages/cms/licensing` по канону four-layer; криптографически проверяемые лицензии в духе GitLab; жизненный цикл лицензии, управляемый подпиской.

**Non-Goals:**

- Консольный UI (frontends/admin) — отдельное изменение.
- Полиморфизация `payments` (плательщик остаётся денормализованным строковым subject-ключом, см. Д13).
- Привязка лицензии к инстансу (fingerprint/seat), телеметрия, self-service-портал организаций.
- Изменение статус-машины подписок (кроме багфикса `past_due → past_due`), формата идемпотентных ключей, семантики сдвига периода (guard 0.7) и порядка листенеров (И8).

## Decisions

### Д1. Новый пакет `cms/licensing` в pay-service, а не расширение `cms/pay`

Лицензирование поставок и подписочный биллинг — разные bounded context'ы. Вшивание в `cms/pay` перегрузило бы его Plan-модель и смешало права/маршруты. «Пятый сервис» отвергнут: объём мал, pay-service уже хост коммерческих admin-API. Связь контекстов — только через полиморфные подписки и события `cms/contracts` (Д12), прямой зависимости `pay ↔ licensing` нет ни в одну сторону.

### Д2. Собственные Plan/PlanFeature лицензирования с префиксом таблиц `license_`

Модели `Organization`, `Plan`, `PlanFeature`, `License`, `SigningKey` в `Cms\Licensing\Domain\Models`; таблицы `licensing_organizations`, `license_plans`, `license_plan_features`, `licenses`, `license_signing_keys` — префикс исключает конфликт с `plans`/`features` биллинга в той же БД. Лицензионный план получает **опциональную** цену (`price_minor`, `currency`, `interval`, все nullable): без цены план чисто «ручной» (лицензии выпускаются оператором), с ценой — реализует `Subscribable` и на него можно оформить подписку организации.

### Д3. Криптосхема: Ed25519, пара ключей на проект, лицензионный файл-конверт

Схема «как в GitLab»: приватный ключ у вендора, публичный встроен в поставку, проверка офлайн.

- **Пара ключей**: лениво на проект (`sodium_crypto_sign_keypair`); `secret_key` шифруется Laravel `Crypt`, публичный — открыто; одна активная пара на проект.
- **Активационный ключ** (`licenses.key`): `LIC-XXXXX-XXXXX-XXXXX-XXXXX-XXXXX` (25 символов Crockford Base32 из `random_bytes`, ~125 бит), глобально уникален; сам по себе прав не даёт.
- **Лицензионный файл**: base64-конверт `{"data": base64(payload-JSON), "signature": base64(ed25519)}`. Payload: `license_id (uuid)`, `key`, `organization` (название), `plan` (code), `features` (коды), `issued_at`, `expires_at`. Поставка проверяет подпись и срок без сети.
- «public_key передаёт клиент» = клиентская поставка держит только публичный ключ проекта (оператор получает его admin-эндпоинтом и встраивает в дистрибутив).

Альтернативы: RSA (длиннее, без выгод), JWS/JWT (лишняя зависимость), клиентская пара с подписью вендора (усложняет поставку, не даёт выгод без instance-binding — вне скоупа).

### Д4. Переопределения фич: `license_plan_features.organization_id` nullable

Запрошенные поля (`organization_id`, `plan_id`, `name`) — одной таблицей: `organization_id = NULL` — базовая фича плана; заполненный — дополнительная фича этого плана для конкретной организации. Эффективный набор = базовые + переопределения; фиксируется в payload на момент выпуска/перевыпуска. К `name` добавляется машинный `code` (по нему поставка гейтит функциональность).

### Д5. Статус лицензии — вычисляемый, в БД только факты

`issued_at`, `expires_at`, `revoked_at`; enum `LicenseStatus: Active | Expired | Revoked` (`revoked_at` приоритетнее истечения). Отзыв необратим и всегда ручной; колонки `status` нет — нечему рассинхронизироваться.

### Д6. Публичная валидация без утечек

`POST /api/v1/pay/licensing/validate`: вход — только `key`; для `active` — статус, code плана, коды фич, `expires_at`; для несуществующего/отозванного/истёкшего — единый `invalid` без причин. Throttle; PII организации в ответ не попадает; проект резолвится по самому ключу.

Все маршруты licensing живут под существующими pay-префиксами (`/api/v1/pay/licensing/*`, `/api/admin/v1/projects/{project}/pay/licensing/*`): gateway (infra/gateway/Caddyfile) маршрутизирует в pay-service по префиксам `^/api/admin/v1/projects/[^/]+/pay` и `/api/v1/pay/*` — свои префиксы потребовали бы правки инфраструктуры. Альтернатива с отдельным `@licensing`-матчером в Caddyfile отвергнута как лишняя сущность для модуля, живущего внутри pay-service.

### Д7. Права — `pay.licensing.view|manage` в PayManifest

По образцу `pay.providers.*`: две `PermissionDefinition` (строки — зависимость pay → licensing не возникает). Отдельный manifest-ключ отвергнут: сервис-хост один.

### Д8. Конвенции именования

`expires_at` (не `expired_at`); UUID PK для `licenses` (входит в payload); DTO — spatie/laravel-data, папки на сущность, конвейер FormRequest → DTO → Handler → Resource; доменные нарушения — `*RuleViolation extends ValidationException`.

### Д9. Регистрация в механических гейтах

`licensing` добавляется в `ArchitectureGateTest::modulePackages()` и в `MODULES` `tools/refactor-inventory.sh` тем же изменением.

### Д10. Полиморфный подписчик: пара type+id с поддержкой «внешних» типов

`subscriptions.user_key` → `subscriber_type` (string) + `subscriber_id` (string). Ключевое ограничение: site-пользователь живёт в БД auth-service, Eloquent-морф на него невозможен — поэтому подписчик моделируется **VO `Subscriber` (type + id)**, а не обязательной morph-связью. VO живёт в `Cms\Shared\Billing` рядом с `Subscribable`: его порождает `RequestIntrospection` из shared, а shared не может зависеть от pay-типов. Типы: `site_user` (внешний, без локальной модели; id = userId из интроспекции) и `organization` (локальная модель licensing, морф-алиас регистрирует её провайдер через `Relation::morphMap`). Перечень типов открыт — новый подписчик = новый алиас, без миграции. `SubscriptionPolicy::ownedBy` фильтрует по паре (семантика 404 сохраняется); анти-дубль — одна живая подписка на (subscriber_type, subscriber_id, subject_type, subject_id). Индексы: единый составной по четвёрке (покрывает и префикс-запросы по паре подписчика) плюс отдельный (subject_type, subject_id) для выборок по предмету (архивация плана с подписками). `SiteUserKey` VO упраздняется: `RequestIntrospection` получает метод, отдающий `Subscriber('site_user', userId)`; прежний строковый формат остаётся только как аналитический subject-ключ (Д14). Бэкфилл: `user_key` `user:{p}:{id}` → (`site_user`, `{id}`).

Альтернатива «классический morphTo с nullable-моделью» отвергнута: для site_user связь всегда null, а полиморфизм через VO честно отражает, что подписчик — идентичность, не обязательно строка в локальной БД.

### Д11. Полиморфный предмет: morphTo + контракт `Subscribable` в `cms/shared`

`plan_id` (FK) → `subject_type` + `subject_id` (morphTo, алиасы `plan` → `Cms\Pay\Domain\Models\Plan`, `license_plan` → `Cms\Licensing\Domain\Models\Plan`). Контракт `Cms\Shared\Billing\Subscribable` (в shared, потому что нужен `Money`, а contracts ниже shared): `subscriptionPrice(): Money`, `subscriptionInterval(): DateInterval`, `subscriptionCode(): string`, `subscriptionName(): string`. Оба плана реализуют его (`Cms\Pay\Plan` — делегируя `price()`/`periodInterval()`; лицензионный план — только при заполненной цене, иначе оформление отклоняется доменной ошибкой). `SubscribeHandler`, `RenewSubscriptionHandler`, `ExtendSubscriptionPeriod`, `PaymentAnalyticsProps` переходят с `plan`-relation на морф + контракт; props аналитики сохраняют ключи `plan`/`plan_id`/`plan_name` (значения — code/id/name предмета) ради непрерывности отчётов. FK дропается; целостность предмета — уровнем приложения (морф-резолв при оформлении) + запрет удаления предмета с подписками (уже есть для планов: архивация вместо удаления).

Публичный контракт сайта не меняется: `SubscribeRequest` принимает `plan_code`, контроллер резолвит его в subject `plan` — полиморфизм не протекает в сайтовый вход.

### Д12. События подписки — скалярные, в `cms/contracts`

Вводятся `Cms\Contracts\Events\SubscriptionStarted` и `SubscriptionPeriodExtended` (readonly, скаляры: subscriptionId, projectId, subscriberType/Id, subjectType/Id, periodEndsAt). Диспатчит pay (`SubscribeHandler` и `ExtendSubscriptionPeriod`), слушает licensing — зависимость обоих только от contracts, связь pay ↔ licensing не возникает. Синхронные, как все доменные события платформы (И8); листенеры licensing идемпотентны. Альтернатива «licensing напрямую вызывает pay-handlers» отвергнута — создала бы жёсткую зависимость модулей.

### Д13. `payments.user_key` → `subject_key`; платёж не полиморфизируется

Плательщик платежа остаётся денормализованной строкой — аналитическим subject-ключом (Д14), вычисляемым из `Subscriber` в момент создания платежа. Переименование в `subject_key` фиксирует семантику (это ключ субъекта аналитики, не «пользователь»). В Platega он продолжает уходить как `metadata.userId`. Полный морф на payments отвергнут: платежу субъект нужен только для аналитики/антифрода, а два способа адресовать одного субъекта (морф в подписке + строка в платеже) дешевле, чем каскадный рефакторинг платёжного контура.

### Д14. Subject-ключи аналитики: прежний формат для людей, новый namespace для организаций

`Subscriber::subjectKey(projectId)`: `site_user` → `user:{project}:{id}` (байт-в-байт прежний — история ClickHouse и склейка с `auth/User::subjectKey()` непрерывны); прочие типы → `{type}:{project}:{id}` (организация — `organization:{project}:{id}`). `Cms\Shared\Analytics` обобщает вывод `project_id`: парсинг `{segment}:{project}:{id}` вместо жёсткого префикса `user:`. Иммутабельные строки ClickHouse не мигрируются — их и не требуется: формат старых субъектов не меняется.

### Д15. Жизненный цикл лицензии по подписке

Оформление подписки организации на лицензионный план (admin-эндпоинт, Д16) → листенер licensing на `SubscriptionStarted` выпускает лицензию с `expires_at = current_period_ends_at` (оптимистично, как и текущее оформление site-подписок; первый платёж — по существующему конвейеру). `SubscriptionPeriodExtended` → перевыпуск payload той же лицензии с новым `expires_at` (активационный ключ и запись сохраняются — клиент скачивает обновлённый файл, онлайн-валидация видит срок сразу). Отмена/пауза подписки лицензию не трогают — она доживает до `expires_at`; отзыв остаётся ручным и необратим: **отозванная** лицензия при последующих оплатах периода не перевыпускается и остаётся `revoked`. Ручной выпуск лицензий без подписки полностью сохраняется (планы без цены). Если у организации уже есть **неотозванная** (в том числе истёкшая) лицензия по плану, `SubscriptionStarted` продлевает её, а не плодит вторую.

### Д16. Admin-оформление подписки — обобщённое

`POST /api/admin/v1/projects/{project}/pay/subscriptions` (право `pay.subscriptions.manage`): `subscriber_type`+`subscriber_id`, `subject_type`+`subject_id`, опционально `provider` первого платежа (например `manual`) — иначе берётся провайдер из настроек проекта (`PaymentsSettings::provider`, дефолт `platega`: без опции admin-оформление организации в Platega-проекте ушло бы во внешний шлюз). Валидация: subject резолвится морфом и реализует `Subscribable`; локальный subscriber (организация) обязан существовать в проекте; `site_user` через admin тоже допустим (id не проверяется — внешний тип). Используется существующий `SubscribeHandler` (единый анти-дубль, единый платёжный конвейер; `provider` прокидывается в `CreatePaymentDTO`). Лицензионного специального эндпоинта нет — licensing реагирует событиями.

### Д17. Багфикс ретраев продления

`SubscriptionStatus::canTransitionTo` разрешает self-переход `past_due → past_due` (или handler не вызывает `transitionTo` при совпадении статуса): повторное неуспешное продление инкрементирует `renewal_attempts` до лимита 5, как требует действующая спека «повторные попытки». Снимки-guard'ы renewal (задача 0.7) не трогаются: формат идемпотентного ключа и семантика сдвига периода сохраняются.

## Risks / Trade-offs

- [Бэкфилл subscriptions на живых данных] → миграция портируемой техникой (PHP-бэкфилл чанками через query builder либо SQL-выражения, работающие и в Postgres, и в sqlite — тестовый контур гоняет миграции на sqlite `:memory:`, `split_part` недопустим), в одной транзакции, с проверкой количества строк до/после; колонки `user_key` дропаются в той же миграции только после бэкфилла; rollback-ветка восстанавливает строку конкатенацией; прогон и на sqlite (тесты), и на копии Postgres-данных.
- [Переснятие 19 снимков-контрактов маскирует случайные регрессии] → переснимать по одному, диффом сверяя, что изменились ТОЛЬКО поля subscriber/subject_key/plan→subject; поведенческие guard-тесты (404-семантика, непагинированный mine, деньги int, идемпотентные ключи) должны пройти без правок ассертов.
- [Утрата/компрометация приватного ключа проекта] → хранение только шифрованным в БД (бэкапы покрывают утрату); при компрометации — перегенерация пары и перевыпуск активных лицензий (ручной сценарий, документируется).
- [Перебор активационных ключей] → ~125 бит энтропии + throttle + единый `invalid`.
- [Офлайн-поставка не узнаёт об отзыве] → компромисс модели GitLab; смягчение — короткие периоды подписки/`expires_at` и перевыпуск.
- [Две модели Plan (pay и licensing)] → разные namespace, таблицы `license_*`, явные импорты; морф-алиасы `plan` и `license_plan` различают их в данных.
- [Обобщённый парсинг subject-ключей в Analytics] → регресс-тест на прежний формат `user:*` обязателен; события с ключами, не подходящими под шаблон, ведут себя как сейчас (без project_id-вывода).
- [Синхронный листенер licensing удорожает оформление/продление подписки] → перевыпуск payload — локальная криптооперация без сети (микросекунды на libsodium); при ошибке листенера транзакция продления откатывается целиком — это осознанно: лицензия и подписка не должны разъезжаться.

## Migration Plan

1. Пакет `cms/licensing`: новые таблицы `0004_01_01_*` (только CREATE) — `./tools/cms migrate pay`.
2. Пакет `cms/pay`: миграция `0003_01_02_*` — добавить морф-колонки, бэкфилл из `user_key`/`plan_id`, снять FK `plan_id`, дроп `user_key`, rename `payments.user_key`→`subject_key`, новые индексы. Прогон на копии данных до деплоя.
3. Деплой одним релизом (сервисы независимы, наружу смотрит только pay-service); after-deploy: сид манифеста (права), пересборка swagger.
4. Rollback: обратная миграция (морф-колонки → `user_key`/`plan_id` конкатенацией/парсингом, восстановление FK), дроп licensing-таблиц; подписки, созданные в новой модели с не-site подписчиками, при откате теряют смысл — откат допустим только до первого оформления организации (окно фиксируется в release-notes).
