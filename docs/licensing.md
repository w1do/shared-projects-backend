# Лицензирование self-hosted-поставок и полиморфные подписки

Изменение `licensing-and-polymorphic-subscriptions`: новый модуль-пакет
`packages/cms/licensing` (bounded context лицензирования поставок в
pay-service) и перевод подписок `cms/pay` на полиморфную модель
подписчик+предмет. Полные решения — `openspec/changes/…/design.md` (Д1–Д17).

## Полиморфные подписки (`cms/pay`)

- Схема `subscriptions`: вместо `user_key`/`plan_id` — пары
  `subscriber_type`+`subscriber_id` и `subject_type`+`subject_id`
  (миграция `0003_01_02_*` с портируемым PHP-бэкфиллом и обратным ходом;
  прогнана на sqlite-тестах и Postgres-копии). `payments.user_key`
  переименован в `subject_key` — денормализованный субъект-ключ аналитики.
- Подписчик — VO `Cms\Shared\Billing\Subscriber` (type+id): `site_user` живёт
  в БД auth-service, поэтому подписчик — идентичность, а не морф-связь.
  Предмет — morphTo `subject` + контракт `Cms\Shared\Billing\Subscribable`
  (цена, интервал, код, имя); реализуют тарифный план pay (алиас `plan`)
  и лицензионный план (`license_plan`).
- Субъект-ключи аналитики: `site_user` — прежний `user:{project}:{id}`
  байт-в-байт (непрерывность ClickHouse), организации —
  `organization:{project}:{id}`; `Cms\Shared\Analytics` выводит `project_id`
  из обобщённого шаблона `{type}:{project}:{id}`.
- Межмодульные события `Cms\Contracts\Events\SubscriptionStarted` /
  `SubscriptionPeriodExtended` (скаляры) — pay диспатчит, licensing слушает;
  прямой зависимости pay ↔ licensing нет.
- Admin-оформление `POST /api/admin/v1/projects/{project}/pay/subscriptions`
  (`pay.subscriptions.manage`): полиморфные подписчик и предмет, опциональный
  `provider` первого платежа (иначе — из настроек проекта). Публичный контракт
  сайта (`plan_code` + `X-User-Token`) не изменился.
- Wire-форма (BREAKING): в подписке `subscriber {type, id}` вместо `user_key`,
  `subject {type, …}` вместо `plan`; в платеже `subject_key`. 19 снимков
  переснято, диффы ограничены этими полями.
- Багфикс Д17: self-переход `past_due → past_due` разрешён — повторное
  неуспешное продление инкрементирует `renewal_attempts`, не роняя ретраи.

## Модуль `cms/licensing`

Канонический four-layer, зарегистрирован в `ArchitectureGateTest` и
`tools/refactor-inventory.sh`. Таблицы: `licensing_organizations`,
`license_plans`, `license_plan_features`, `licenses`, `license_signing_keys`
(миграция `0004_01_01_*`, префиксы исключают конфликт с таблицами биллинга).

- **Organization** — анкета покупателя (контакты, сфера, размер, цель);
  admin CRUD; полноправный полиморфный подписчик.
- **Plan/PlanFeature** — планы поставки с опциональной ценой периода
  (тройка `price_minor`/`currency`/`interval` целиком или ничего; без цены —
  только ручной выпуск); фичи базовые (`organization_id IS NULL`) и
  пер-организационные переопределения; эффективный набор = базовые +
  переопределения, фиксируется в payload на момент выпуска.
- **License** — uuid, активационный ключ `LIC-XXXXX-…` (Crockford Base32,
  ~125 бит), подписанный Ed25519 payload (конверт `{data, signature}` base64);
  статус вычисляется из фактов, `revoked_at` приоритетнее; отзыв необратим.
- **Криптосхема**: пер-проектная пара `sodium_crypto_sign_keypair`, приватный
  ключ только шифрованным (`encrypted`-cast), публичный — admin-эндпоинтом
  для встраивания в поставку; офлайн-проверка подписи без сети.
- **Публичная валидация** `POST /api/v1/pay/licensing/validate` (throttle,
  без ключа проекта): для `active` — статус/код плана/фичи/срок без PII,
  для несуществующего/отозванного/истёкшего — единый `invalid`.
- **Жизненный цикл по подписке**: оформление подписки организации на
  лицензионный план авто-выпускает лицензию до конца оплаченного периода
  (существующая неотозванная — продлевается, не дублируется); оплата
  продления перевыпускает payload с новым сроком и прежним ключом (и в
  вебхук-джобе — ключи пары адресуются `project_id` события, без проектного
  контекста); отмена подписки лицензию не трогает; отозванная лицензия
  оплатой не воскресает.
- **Права**: `pay.licensing.view|manage` в `PayManifest` (группа `licensing`).

## Безопасность и целостность

- Tenant-изоляция: `BelongsToProject` на всех моделях; организация/план/лицензия
  чужого проекта — 404, «чужой» подписчик admin-оформления — доменная 422.
- Приватный ключ не покидает хранилище: шифрование Crypt, `hidden` на модели,
  тест «приватный ключ отсутствует во всех API-ответах».
- Деньги — только целые минорные единицы (`Money`); цена licensing-плана
  атомарной тройкой.
- Владение подпиской — условием выборки по паре подписчика (404, не 403).
- Гейты: снимки-контракты всех новых маршрутов (guard 0.3), Larastan level 8,
  `refactor-inventory --strict`, полный `tools/smoke.sh`.

## API

Все маршруты под pay-префиксами gateway (Caddyfile не менялся):
`/api/admin/v1/projects/{project}/pay/licensing/*` (организации, планы, фичи,
лицензии: выпуск/файл/отзыв/список, публичный ключ) и
`/api/v1/pay/licensing/validate`. Swagger пересобирается `./tools/cms api`
(licensing включён в источники pay).
