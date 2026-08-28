# Design: licensing-perpetual-model

## Context

Мотивация — в `proposal.md`. Исходное состояние:

- `packages/cms/licensing` реализует v1-модель: `licenses` с открытым `key`, конвертом `signed_payload` `{data, signature}` и `expires_at`; публичный `POST validate`; admin-эндпоинт скачивания файла. Обвязка — `organizations`, `plans` + `plan_features`, `signing_keys` (Ed25519-пара на проект, приватный ключ шифрован) — остаётся без изменений.
- Полиморфные подписки pay уже есть: события `SubscriptionStarted` / `SubscriptionPeriodExtended` в `cms/contracts`, синхронные листенеры в `LicensingServiceProvider`.
- Завершённое, но не заархивированное изменение `console-licensing-organizations`: сервис `licensing` в реестре, консольный раздел с вкладками организаций/планов/лицензий (файлы в рабочем дереве).
- Эталон — ТЗ `lic.md` (корень репозитория): части 1–2 (модель, сервер лицензий) в объёме, часть 2.5 (registry token service) и часть 3 (клиент) — вне объёма. Registry — GitLab Container Registry.
- Платформенные инварианты: four-layer DDD/CQRS (ArchitectureGateTest), tenant-изоляция `project_id`, конвейер FormRequest → DTO → Handler → Resource, envelope ApiResponse.

## Goals / Non-Goals

**Goals:**

- Perpetual-модель лицензии в существующем пакете `cms/licensing` без создания нового пакета и без изменения gateway-префиксов.
- Полный клиентский контракт activate/refresh/deactivate/updates-check + офлайн-активация, пригодный для будущей клиентской части поставки.
- Переиспользование существующей инфраструктуры подписи (per-project `SigningKey`) для нового формата токена.

**Non-Goals:**

- Токен-сервис Docker Registry (`/v2/token`, RS256 JWT) и выдача pull-креденшелов GitLab per-license — отдельное изменение, когда определится механика доступа в GitLab.
- Клиентская state-машина поставки (часть 3 ТЗ: trial, `EnsureLicense`, `license_state`) — репозиторий дистрибутива.
- CI-регистрация релизов (часть 4 ТЗ): каталог наполняется руками через админку; API для CI — позже (обычный admin-эндпоинт уже пригоден для этого).
- Изменения `cms/pay`: события и подписки не трогаются.

## Decisions

### Д1. Миграция — вперёд, с дропом старых лицензий

Новая миграция в пакете licensing дропает таблицу `licenses` (v1) и создаёт `licenses` (новая схема), `license_installations`, `releases`. `organizations`, `plans`, `plan_features`, `signing_keys` не затрагиваются. Данные лицензий не переносятся — поставок на них нет (согласовано).
*Альтернатива* — переписать базовую миграцию `0004_...`: отвергнуто, живые dev-стенды обновляются только вперёд (`./tools/cms migrate`), fresh не требуется.

### Д2. Схема `licenses`

UUID PK (как в v1, `HasUuids`), `project_id` (`BelongsToProject`), `organization_id`, `plan_id`, `key_hash` char(64) unique (глобально — резолв проекта по ключу), `key_prefix` string(16), `key_encrypted` text nullable (Д8), `edition` string(32) — снимок `code` плана, `features` json — снимок эффективных кодов фич, `entitled_version` string(20) nullable, `updates_until` date, `max_installations` smallint default 1, `revoked_at` nullable, `note` text nullable, `issued_at`. Статус вычисляется (`revoked_at`), enum `LicenseStatus` сокращается до `Active|Revoked`. Организация и план остаются обязательными FK — в отличие от ТЗ (`company_id` nullable): у нас лицензия всегда выпускается покупателю по плану, edition/features снимаются с плана в момент выпуска.

### Д3. Ключ: `LIC-XXXX-XXXX-XXXX-XXXX`

16 значащих символов алфавита `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (~80 бит) через `random_int()`. Нормализация: `strtoupper(trim())`. Хранение: `hash('sha256', normalized)` + `key_prefix` = первая группа с префиксом (`LIC-XXXX`). Контракт `LicenseKeyGenerator` сохраняется, реализация заменяет Crockford-25. Ключ не пишется в логи и audit; в ответах — только при выпуске (и однократном показе, Д8).

### Д4. Токен: base64url + Ed25519 detached по сырым байтам

`b64url(payload_json) . '.' . b64url(signature)`, base64url без паддинга. Подпись — `sodium_crypto_sign_detached` по **тем же байтам** JSON, что закодированы в токен (`JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE`); пересборка JSON при проверке запрещена. Подписант — существующая per-project пара `SigningKey` через новый Infrastructure-сервис выпуска токенов; v1-конверт `{data, signature}` и `sealWith()` удаляются. TTL: онлайн 30 дней, офлайн 1 год — в конфиге пакета. Payload — строго по ТЗ 1.6 (`license_id` — UUID строкой). `GetSigningPublicKeyQuery` и admin-эндпоинт публичного ключа остаются как есть.

### Д5. Пересчёт entitled_version — в PHP

Эффективное право = `max(version_compare)` из сохранённой `entitled_version` и версий релизов проекта с `released_at <= updates_until`. Каталог релизов мал — выбирается по проекту и сравнивается `version_compare` в Application-слое (общий доменный сервис/VO, используемый activate/refresh, renew и updates/check).
*Альтернатива* — сортировка SemVer в SQL (массивы int в Postgres): отвергнута как несовместимая с простотой и избыточная для десятков строк.

### Д6. Контракт ошибок и revoked-семантика

Коды ТЗ 1.7 (`license_not_found` 404, `unknown_installation` 404, `license_revoked` 403, `installation_limit_reached` 409, `validation_failed` 422) кладутся в стандартный envelope платформы с русским `message`. Разрез по эндпоинтам: `activate`/`refresh` по отозванной лицензии возвращают **200 с подписанным revoked-токеном** (ТЗ 2.3 — голый 403 не отдавать); `updates/check` по отозванной — 403 `license_revoked`. Доменные нарушения admin-стороны — существующий паттерн `*RuleViolation`.

### Д7. Установки: одно поле `revoked_at` для деактивации и отзыва

Клиентский `deactivate` и операторский отзыв копии ставят `revoked_at`; отозванная установка не проходит activate/refresh (`unknown_installation`), слот считается по установкам с `revoked_at IS NULL`. Переезд = deactivate + активация с новым `install_id` (генерируется машиной клиента). Гонки двойной активации закрываются транзакцией с `lockForUpdate()` лицензии при подсчёте слотов.

### Д8. Ключ авто-выпущенной лицензии: encrypted-until-reveal

Листенер подписки не имеет канала вернуть plaintext-ключ (ответ оформления подписки принадлежит pay, события контрактов неизменяемы). Поэтому при авто-выпуске ключ сохраняется в `key_encrypted` (`Crypt::encryptString`); admin-эндпоинт «показать ключ» (manage) возвращает его один раз и необратимо затирает колонку. При ручном выпуске ключ возвращается сразу в ответе и `key_encrypted` не заполняется. Отступление от ТЗ («в БД только hash») минимально: копия шифрована app-ключом и живёт до первого показа.
*Альтернативы*: мутируемое поле в событии контрактов (связывает pay с licensing — отвергнуто); показывать ключ только при ручном выпуске (ломает главный сценарий продаж — отвергнуто).

### Д9. Маршруты

Публичные (`routes/public.php`, throttle `60,1`): `POST /api/v1/pay/licensing/license/activate|refresh|deactivate`, `POST /api/v1/pay/licensing/updates/check`; `POST validate` удаляется. Admin (`routes/admin.php`, гейт `EnsureServiceEnabled:licensing`): добавляются `POST licenses/{license}/renew`, `POST licenses/{license}/reveal-key`, `POST licenses/{license}/offline-activation`, `GET licenses/{license}/installations`, `POST installations/{installation}/revoke`, CRUD `releases`; удаляется `GET licenses/{license}/file`. Caddyfile не меняется (всё под pay-префиксом).

### Д10. Подписочные листенеры → общие handlers

`IssueLicenseOnSubscriptionStarted` вызывает тот же `IssueLicenseHandler` (с `max_installations = 1`, `updates_until` = конец периода, авто-`entitled_version`); `ReissueLicenseOnPeriodExtended` переименовывается по смыслу в продление и вызывает `RenewLicenseHandler` — тот же, что у ручного admin-продления. Один путь кода для ручного и подписочного сценариев.

### Д11. Отчёт «кто отстал» — фильтр, не отчёт

Список установок лицензии + admin-фильтр установок проекта по `app_version` ниже заданной (query-параметр списка). Отдельный отчётный экран — вне объёма.

### Д12. Консоль

`LicensesSection` переписывается под новую модель (форма выпуска, модал ключа-один-раз, продление, установки с отзывом, офлайн-активация: загрузка файла-запроса и скачивание токен-файла); добавляется `ReleasesSection`. Файлы `components/`/`app/` зеркалируются admin ↔ source-admin побайтово, API-обвязка (hooks, data-source, query keys) — только в `frontends/admin`. Тексты — реестр `console.*`. После правок — пересборка admin-front (restart контейнера, ждать Ready).

## Risks / Trade-offs

- [Ломается публичный контракт validate] → Поставок в эксплуатации нет (подтверждено); смоук `tools/smoke.sh` переводится на activate-флоу в этом же изменении.
- [Изменение поверх незаархивированного `console-licensing-organizations`] → Сначала архивируется оно (его дельты становятся main-спеками), затем применяется это изменение; дельта `console-licensing-ui` написана относительно его требований.
- [Подпись по пересобранному JSON вместо сырых байт — незаметная ошибка] → Тест «порча байта payload ломает подпись» + тест проверки токена чистым `sodium_crypto_sign_verify_detached` без кода выпуска.
- [Гонка параллельных активаций пробивает лимит установок] → `lockForUpdate()` лицензии в транзакции активации.
- [`version_compare` с нестрогим SemVer в каталоге] → FormRequest релиза валидирует `version`/`train` регэкспами SemVer; сравнение только по валидированным значениям.
- [Утечка ключа через audit/логи] → Ключ существует только в ответе выпуска/показа; в activity log пишутся id и префикс.

## Migration Plan

1. Применить бэкенд licensing-пакета + миграцию (drop v1 `licenses`, create новых таблиц) → `./tools/cms migrate`.
2. Обновить снимки характеризационных тестов и smoke.
3. Консоль: пересборка admin-front, e2e.
4. Rollback: revert коммита + обратной миграции нет (данные v1 не переносились и не восстанавливаются — согласовано, эксплуатационных лицензий нет).

## Open Questions

- Механика выдачи клиентам pull-доступа к GitLab Registry (deploy tokens per license vs групповой токен на трейн) — решается в изменении про registry-доступ; на контракт этого изменения не влияет (`updates/check` уже возвращает путь образа).
