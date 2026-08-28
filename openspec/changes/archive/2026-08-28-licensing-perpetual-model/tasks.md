# Tasks: licensing-perpetual-model

## 1. Домен и схема данных

- [x] 1.1 Миграция перехода: drop v1 `licenses`, создание `licenses` (Д2), `license_installations` (unique `license_id`+`install_id`), `releases` (unique `project_id`+`version`); проверить `./tools/cms migrate` на dev-стенде без ошибок и наличие таблиц
- [x] 1.2 Переработать `License` (entitlements, `key_hash`/`key_prefix`/`key_encrypted`, вычисляемый статус без Expired, удалить `sealWith`/`payload`/конверт), сократить `LicenseStatus` до `Active|Revoked`; новые модели `LicenseInstallation`, `Release` + фабрики; проверить `composer stan` пакета licensing
- [x] 1.3 Генератор ключей `LIC-XXXX-XXXX-XXXX-XXXX` (алфавит без `0O1I`, `random_int`), нормализация и хэширование; юнит-тест: формат, алфавит, уникальность, `sha256` от нормализованной формы
- [x] 1.4 Сервис выпуска лицензионных токенов (Д4): payload v1 по ТЗ 1.6, base64url без паддинга, Ed25519 detached по сырым байтам через per-project `SigningKey`; юнит-тесты: проверка чистым `sodium_crypto_sign_verify_detached`, порча байта payload ломает подпись, TTL 30 дней/1 год из конфига

## 2. Application: команды и запросы

- [x] 2.1 Переработать `IssueLicenseCommand/Handler` + DTO: новые поля (updates_until, max_installations, entitled_version?, note), снимок edition/фич, авто-`entitled_version` по каталогу релизов, plaintext-ключ в результате; тест: выпуск фиксирует снимок, ключ в БД только хэшем
- [x] 2.2 `RenewLicenseCommand/Handler`: сдвиг `updates_until` вперёд + подъём сохранённой `entitled_version` (Д5, никогда не понижается), доменные ошибки для даты не позже текущей и отозванной лицензии; тесты обоих отказов и успешного продления
- [x] 2.3 Сервис эффективной `entitled_version` (Д5) + `RevealLicenseKeyCommand/Handler` (показ один раз, затирание `key_encrypted`, повторный показ — доменная ошибка); тесты пересчёта (релиз в окне/вне окна) и однократности показа
- [x] 2.4 Команды/запросы активационного контракта: `ActivateLicense`, `RefreshLicense`, `DeactivateInstallation`, `CheckUpdates` + `OfflineActivateLicense` — слоты с `lockForUpdate`, телеметрия установки, revoked-токен на 200, ошибки ТЗ 1.7, правило security-патчей и `latest_available` в updates/check; Pest-тесты по каждому сценарию ТЗ 2.9 (лимит 409, revoked-токен, патч после окна доступен, минор после окна недоступен)
- [x] 2.5 CRUD релизов (`UpsertRelease`, `DeleteRelease`, `ListReleases`, `FindRelease`) с валидацией SemVer/трейна и уникальностью версии в проекте; тесты дубликата и tenant-изоляции
- [x] 2.6 Запросы/handlers списка и просмотра лицензий: entitlements, `key_prefix`, счётчик активных установок, фильтры организация/статус (`active|revoked`), установки в просмотре + фильтр установок по `app_version` ниже заданной (Д11); тест фильтров

## 3. Presentation и маршруты

- [x] 3.1 Публичные контроллеры/Requests/Resources: `license/activate|refresh|deactivate`, `updates/check`; `routes/public.php` с throttle `60,1`, удаление `validate`; проверить конвейер FormRequest → DTO → Handler → Resource и envelope ошибок с кодами ТЗ
- [x] 3.2 Admin-контроллеры/Requests/Resources: переработка issue/show/index, новые `renew`, `reveal-key`, `offline-activation`, `installations` (+`revoke` установки), CRUD `releases`; `routes/admin.php` под правами `pay.licensing.view|manage` и гейтом `licensing`, удаление `/file`; проверить `ArchitectureGateTest` зелёный
- [x] 3.3 Адаптировать подписочные листенеры (Д10): старт → `IssueLicenseHandler` (`updates_until` = конец периода, ключ в `key_encrypted`), продление → `RenewLicenseHandler`, отмена — noop; переписать `SubscriptionListenersTest`/`SubscriptionLicenseCycleTest` на perpetual-семантику (лицензия живёт после конца периода)

## 4. Тесты и контракты backend

- [x] 4.1 Переписать характеризационные тесты и снимки licensing (issue с ключом один раз, renew, reveal-key 422 повторно, activate/refresh/deactivate/updates-check, releases CRUD, удалённые validate и file — 404); `./tools/cms test pay` зелёный
- [x] 4.2 Прогнать полный качественный гейт: `composer lint`, `composer stan`, `./tools/cms test` — без регрессий в остальных пакетах (auth-снимки services/introspect при необходимости обновить)
- [x] 4.3 Пересобрать swagger `./tools/cms api` и обновить `tools/smoke.sh`: шаг валидации заменить на activate → refresh → updates/check; smoke зелёный на dev-стенде

## 5. Консоль

- [x] 5.1 Data-source и hooks в `frontends/admin`: новые пути/методы licensing (issue/renew/reveal-key/offline-activation/installations/releases), query keys, типы ответов; node-тесты `licensing-paths`/`licensing-access` обновлены и зелёные
- [x] 5.2 Переработать `LicensesSection`: колонки новой модели (`key_prefix`, `entitled_version`, `updates_until`, установки), форма выпуска, модал ключа-один-раз (и для reveal-key), продление, отзыв, просмотр установок с отзывом копии, офлайн-активация (загрузка запроса/скачивание токен-файла); зеркалирование в `source-admin`
- [x] 5.3 Новая `ReleasesSection` (список + CRUD-формы, ошибки дубликата версии) и вкладка «Релизы» в разделе; тексты `console.*` для лицензий/релизов; node-тест `console-texts` зелёный; зеркалирование в `source-admin`
- [x] 5.4 Пересобрать admin-front (restart контейнера, дождаться Ready), пройти e2e `console-navigation` и вручную проверить сценарии: выпуск с показом ключа, продление, отзыв установки, создание релиза, режим read-only без manage

## 6. Финализация

- [x] 6.1 Сверить реализацию с дельта-спеками (`openspec validate --change licensing-perpetual-model --strict`), убедиться, что все сценарии покрыты тестами, отметить чекбоксы и подготовить изменение к архивации
