# Proposal: licensing-perpetual-model

## Why

Текущая модель лицензирования подписочная: лицензия живёт до `expires_at`, кончилась подписка — поставка перестаёт проходить валидацию. Для self-hosted-продукта это неправильная модель: клиент, купивший версию, владеет ею бессрочно. Нужна perpetual-модель как у JetBrains (ТЗ — `lic.md` в корне репозитория): бессрочное право на полученную версию + оплачиваемое окно обновлений (`updates_until`), учёт установок с лимитом, каталог релизов и подписанные Ed25519-токены с entitlements вместо статичного лицензионного файла. Существующие лицензии и их контракт можно дропнуть — поставок на них нет.

## What Changes

- **BREAKING** Переработка модели лицензии в `packages/cms/licensing`: вместо `key` (в открытом виде) + `signed_payload` + `expires_at` — ключ формата `LIC-XXXX-XXXX-XXXX-XXXX` (алфавит без `0 O 1 I`), хранимый только как `sha256`-хэш с `key_prefix` для поиска; entitlements `edition` (code плана), `features` (снимок на момент выпуска), `entitled_version`, `updates_until`, `max_installations`; статус только `active`/`revoked` — понятия «истёкшая лицензия» больше нет. Ключ показывается оператору один раз при выпуске.
- Новая сущность **установка** (`license_installations`): `install_id`, `domain`, `app_version`, `last_ip`, `last_seen_at`, отзыв отдельной копии; уникальность `(license_id, install_id)`, лимит `max_installations`.
- Новая сущность **релиз** (`releases`): каталог выпущенных версий (SemVer, релиз-трейн, репозиторий образа в GitLab Registry, `released_at`, `is_security`, `min_upgrade_from`, `changelog_url`) — источник правды для пересчёта `entitled_version` и проверки обновлений.
- **BREAKING** Публичный контракт для поставок: вместо `POST /validate` — `POST license/activate`, `license/refresh`, `license/deactivate` и `POST updates/check` (правило security-патчей: патчи внутри разрешённого трейна доступны и после `updates_until`). Ответ активации/refresh — лицензионный токен `base64url(payload).base64url(signature)` (Ed25519 detached, TTL 30 дней), выдаваемый всегда — включая отозванную лицензию со `status: revoked` в payload.
- Офлайн-активация для закрытых контуров: оператор загружает файл-запрос установки в админку, выпускает токен с TTL 1 год, отдаёт файл клиенту.
- Admin API: выпуск лицензии с новыми полями, продление (сдвиг `updates_until` + подъём `entitled_version`), отзыв лицензии и отдельной установки, список установок, CRUD релизов. Эндпоинт скачивания лицензионного файла удаляется (заменён токенами), эндпоинт публичного ключа подписи остаётся.
- Адаптация связки с подписками pay: старт подписки организации на лицензионный план → выпуск perpetual-лицензии с `updates_until` = конец оплаченного периода; продление периода → сдвиг `updates_until` и подъём `entitled_version`; отмена подписки лицензию не трогает — замирает только окно обновлений.
- Консоль: переработка вкладки «Лицензии» (форма выпуска, показ ключа один раз, продление, установки, офлайн-активация), новая вкладка «Релизы». Вкладки «Организации» и «Планы» не меняются.
- Собственный токен-сервис Docker Registry не строится: registry — GitLab; выдача pull-доступа per-license — вне объёма этого изменения.

## Capabilities

### New Capabilities

- `licensing/license-activation`: установки поставок и клиентский контракт — activate/refresh/deactivate, Ed25519-токен с entitlements, лимит установок, офлайн-активация, коды ошибок и rate limit.
- `licensing/releases`: каталог релизов — CRUD, пересчёт эффективной `entitled_version` по окну обновлений, правило security-патчей, проверка обновлений `updates/check`.

### Modified Capabilities

- `licensing/license-keys`: perpetual-модель лицензии — формат и хэш-хранение ключа, entitlements вместо срока жизни, статусы `active`/`revoked`, продление как сдвиг окна обновлений; удаляются лицензионный файл и публичная онлайн-валидация.
- `licensing/license-subscriptions`: подписка управляет окном обновлений (`updates_until`/`entitled_version`), а не сроком жизни лицензии.
- `console-licensing-ui`: переработка вкладки «Лицензии» под новую модель и новая вкладка «Релизы».

## Impact

- **Код**: `packages/cms/licensing` — модель `License` (переработка), новые модели `LicenseInstallation`, `Release`; генератор ключей, подписант токенов (base64url detached поверх сырых байт), handlers/queries/DTO/Requests/Resources активации, установок, релизов и продления; листенеры подписочных событий; маршруты `routes/public.php` (новый контракт) и `routes/admin.php` (продление, установки, релизы, офлайн-активация; удаление `/file`). `packages/cms/pay` — не меняется (события уже есть).
- **БД pay-service**: миграция дропает старую таблицу `licenses` и создаёт новые `licenses`, `license_installations`, `releases` (существующие лицензии теряются — согласовано). `organizations`, `plans`, `plan_features`, `signing_keys` не меняются.
- **API**: **BREAKING** — публичный `POST /api/v1/pay/licensing/validate` удаляется, добавляются 4 новых публичных эндпоинта; admin-контракт лицензий меняется (поля выпуска, `key` заменяется на `key_prefix` в ответах, продление, установки, релизы). Swagger пересобрать (`./tools/cms api`).
- **Консоль**: `frontends/admin` (+ зеркало `components/`/`app/` в `source-admin`) — секция лицензий, новая секция релизов, hooks/data-source/тексты `console.*`.
- **Тесты**: переписываются характеризационные снимки licensing, Pest-тесты жизненного цикла и подписочной интеграции; новые тесты по ТЗ 2.9 (пересчёт entitled_version, security-патчи, лимит установок, revoked-токен, порча байта payload → невалидная подпись).
- **Зависимость**: изменение строится поверх завершённого `console-licensing-organizations` (сервис `licensing`, консольный раздел) — его нужно заархивировать до/вместе с этим изменением.
