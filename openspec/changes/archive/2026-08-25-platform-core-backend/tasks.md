# Tasks: platform-core-backend

## 1. Этап 0 — скелет репозитория и инфраструктура

- [x] 1.1 Создать раскладку: apps/{auth-service,content-service,analytics-service,pay-service} — тонкие Laravel-приложения (актуальный стабильный релиз, Octane + Swoole; без Domain/Actions внутри apps), packages/cms/* (shared, contracts, auth, content, analytics, pay, generators — composer path-пакеты), packages/frontend/* (ui-kit, api-client, auth, content, analytics, pay — npm workspaces, каркасы), infra/, tools/; проверить `composer install` + `php artisan about` в каждом приложении
- [x] 1.2 Собрать infra: один общий Dockerfile на все сервисы (APP_SERVICE через build-arg/env), настройки по сервисам infra/services/<service>/{.env.example, octane-, supervisor-конфиги}, единый compose (gateway Caddy/nginx, четыре сервиса, postgres:17 с базой на сервис, redis:7, clickhouse, контейнер фронта админки); проверить: `docker compose up` одной командой поднимает весь стек, `/health` каждого сервиса и фронт отвечают через gateway
- [x] 1.3 Настроить маршрутизацию gateway по префиксам (auth/projects/bootstrap → auth; content → content; analytics + /collect → analytics; pay + /webhooks → pay); проверить curl-ами через единый хост
- [x] 1.4 Реализовать CLI tools/cms (bash-обёртка): up/down/migrate/test [service] и заготовка `cms api`; проверить запуск стека и миграций через tools/cms
- [x] 1.5 Настроить Pint, Larastan (phpstan + larastan, level 8), Pest по пакетам и приложениям + корневые агрегирующие скрипты; GitHub Actions pull-request.yml: тесты, сборка кода (composer + npm workspaces), Larastan, сборка фронта админки, сборка docker-образа — красный шаг блокирует мёрж; проверить зелёный прогон и падение на нарочной ошибке

## 2. packages/cms/shared и contracts — общие контракты

- [x] 2.0 Создать packages/cms/contracts: DTO манифеста сервиса и introspection, JSON Schema аналитических событий; юнит-тесты сериализации
- [x] 2.1 Реализовать в cms/shared http-слой: ErrorEnvelope, ApiResponse, курсорная пагинация, TraceId middleware (генерация + проброс заголовка между сервисами); юнит-тесты формата 422/404
- [x] 2.2 Реализовать в cms/shared tenant-слой: ProjectContext (scoped, Octane-safe), трейт BelongsToProject с global scope, ProjectAwareJob (project_id как ID-параметр, восстановление контекста); тест WorkerStateLeakTest-шаблон для сервисов
- [x] 2.3 Реализовать в cms/shared values: Money (минорные единицы, без float), Currency, Locale, ProjectId; юнит-тесты сериализации amount_minor
- [x] 2.4 Реализовать в cms/shared auth-client: DTO манифеста сервиса и introspection, HTTP-клиент auth-service с сервисным токеном, Redis-кэш introspection (TTL конфигурируемый), middleware AuthorizeOperator / AuthorizeProjectKey / EnsureServiceEnabled (404); юнит-тесты с фейковым транспортом
- [x] 2.5 Реализовать в cms/shared idempotency: middleware Idempotency-Key для мутирующих public-запросов; тест повтора без побочного эффекта
- [x] 2.6 Подключить spatie/laravel-data во все приложения; в каждом модуль-пакете слои Domain/Application(Commands|Queries)/Http: входные и выходные DTO на laravel-data, тонкие контроллеры (принять Data → Command/Query → вернуть Data), без ручного validate() и ручных массивов ответов; рефакторинг уже написанных контроллеров cms/auth под эту структуру; проверка — тесты пакетов зелёные

## 3. auth-service — операторы и доступ (логика в packages/cms/auth)

- [x] 3.0 Настроить два guard'а Sanctum: `admin` (таблица admins, глобальная) и `web` (таблица users с project_id, уникальность email per project); feature-тест: токен guard web получает 401 на admin-маршрутах и наоборот
- [x] 3.1 Миграции admins/users/password_reset_tokens/personal_access_tokens; Actions Login/Logout/ResetPassword/UpdateProfile для операторов, контроллеры /api/admin/v1/auth/*, /me (guard admin); feature-тесты: вход (сессия и Bearer), 401 без auth, 429 rate limit, одноразовость reset-токена и инвалидация сессий
- [x] 3.2 Подключить spatie/laravel-permission (teams-режим, team_id = project_id), миграции spatie + системные роли (super-admin, owner, admin, editor, analyst, viewer) в конфиге; тест сидинга
- [x] 3.3 Реализовать проверку прав на spatie/laravel-permission в teams-режиме (team_id = project_id, setPermissionsTeamId per-request из ProjectContext, сброс между запросами под Octane), роль super-admin через Gate::before, Redis-кэш spatie с инвалидацией при изменении ролей; юнит + feature-тесты (право в проекте A есть, в B — 403; отзыв роли действует немедленно локально)
- [x] 3.4 CRUD кастомных ролей на проект, назначение/отзыв ролей участникам через admin API; feature-тесты
- [x] 3.5 Публичное API конечных пользователей (guard web): /api/v1/auth/register, login, logout, reset-password, me, обновление профиля — проект резолвится из API-ключа сайта, токен привязан к проекту; feature-тесты: регистрация/вход, один email в двух проектах — независимые аккаунты, токен проекта A с ключом проекта B → 401, rate limit, инвалидация токенов при сбросе пароля
- [x] 3.5a Push событий аутентификации в аналитику через Analytics::push (register, login, logout, reset, block) асинхронно с retry; недоступность аналитики не ломает вход; тест с фейковым analytics
- [x] 3.6 Управление пользователями проекта из админки (права auth.users.*): список, блокировка/разблокировка (инвалидация токенов, запрет входа), удаление; feature-тесты

## 4. auth-service — tenant-модель (packages/cms/auth)

- [x] 4.1 Миграции projects/project_members/project_api_keys/project_services/project_settings/audit_logs; модели + фабрики
- [x] 4.2 CRUD проектов (key, name, локали), архивация без удаления, участники (создатель = owner), доступ только участникам (404 не-участнику); feature-тесты
- [x] 4.3 API-ключи: выдача public/secret (секрет один раз, хранится хэш), scopes, отзыв, last_used_at; feature-тесты однократного показа и 401 по отозванному
- [x] 4.4 Включение/выключение сервисов на проект + admin API статуса; feature-тест: выключенный сервис не отдаётся в bootstrap
- [x] 4.5 Настройки сервисов на проект: валидация по схеме из манифеста, шифрование секретных значений, маскирование в ответах; feature-тесты 422 и маскирования
- [x] 4.6 Audit log: запись из Actions (проекты, роли, ключи, сервисы, настройки), чтение через admin API с пагинацией, service-to-service endpoint записи; feature-тесты

## 5. auth-service — манифесты, introspection, bootstrap (packages/cms/auth)

- [x] 5.1 Реализовать регистрацию манифеста сервиса: POST /internal/manifests (сервисный токен), upsert прав и схем настроек, версия манифеста; contract-фикстуры; feature-тест: новое право из манифеста доступно ролям
- [x] 5.2 Реализовать POST /internal/introspect: операторский токен → admin+права в проекте; токен пользователя сайта → user+project_id; API-ключ → project+тип+scopes; включённость сервиса; ответ указывает вид субъекта; только по сервисному токену (401 без него); feature-тесты всех веток, включая отозванные токены/ключи и заблокированных пользователей
- [x] 5.3 Реализовать GET /api/admin/v1/bootstrap: профиль, проекты, текущий проект, сервисы с навигацией/схемами из манифестов, права, translations_version, server_time; фильтрация по включённости и правам; Redis-кэш с инвалидацией на регистрацию манифеста и смену ролей; feature-тесты
- [x] 5.4 Best-effort cache-bust вебхук downstream-сервисам при смене ролей/отзыве ключей; тест отправки
- [x] 5.5 Критерий: два проекта, разные роли — интеграционный сценарий изоляции прав и данных в auth-service; WorkerStateLeakTest

## 6. content-service (логика в packages/cms/content)

- [x] 6.1 Подключить cms/shared auth-client: middleware операторов, API-ключей, EnsureServiceEnabled (404), команда manifest:publish с декларацией прав content.* и навигации; contract-тест против фикстур auth-service
- [x] 6.2 Миграции posts/pages/categories (nested sets: lft/rgt/depth/parent_id)/post_category/revisions/media/seo_meta (полиморфная) — все с project_id + индексы, tsvector для полнотекста; тест миграций
- [x] 6.3 Категории на nested sets: CRUD + перемещение узла с поддеревом (атомарно, с блокировкой дерева проекта), выборки с потомками; feature-тесты перемещения поддерева с сохранением структуры и конкурентных операций
- [x] 6.4 Посты: CRUD, статус-машина draft→scheduled→published→archived (переходы в enum), локали + translation_group, slug, привязка к категориям; feature-тесты жизненного цикла и недопустимых переходов
- [x] 6.5 Страницы: CRUD, уникальный slug в проекте, флаг is_index, публикация; ревизии для постов и страниц (снимок на сохранение, восстановление); feature-тесты
- [x] 6.6 Полиморфное SEO: seo_meta для поста/страницы/категории — title, description, keywords, canonical, robots, OG, Twitter, json_ld (валидация JSON); отдача SEO-блока в admin и public ответах; feature-тесты SEO категории и 422 на невалидный JSON-LD
- [x] 6.7 Медиа: spatie/laravel-medialibrary поверх S3 (MinIO в compose), загрузка, асинхронные конверсии (очередь media), использование как og:image; feature-тест с Queue::fake
- [x] 6.8 PublishScheduledEntriesJob раз в минуту; тест публикации по времени
- [x] 6.9 Публичное API: посты (список с фильтрами по категории с потомками/локали, по slug), страницы по slug, дерево категорий — только published, курсорная пагинация, Redis-кэш с инвалидацией на публикацию; feature-тесты
- [x] 6.10 Генератор sitemap.xml: асинхронная регенерация по изменению контента из published + is_index=true (посты, страницы, категории; исключение noindex), lastmod; публичный маршрут; feature-тесты попадания и исключения
- [x] 6.11 Генератор robots.txt: правила Allow/Disallow из настроек проекта + Disallow закрытых разделов + ссылка на sitemap; публичный маршрут; feature-тест
- [x] 6.12 Отправка событий (публикация поста/страницы) в analytics через Analytics::push асинхронно с retry; недоступность аналитики не ломает публикацию; тест с фейковым analytics
- [x] 6.13 Критерий: сайт получает по API-ключу посты/страницы/категории с SEO, sitemap.xml и robots.txt — интеграционный сценарий через gateway; WorkerStateLeakTest

## 7. analytics-service (логика в packages/cms/analytics)

- [x] 7.1 Подключить cms/shared auth-client + manifest:publish (права analytics.*, навигация); contract-тест
- [x] 7.2 ClickHouse-слой: Connection, BatchWriter, Migrator + команда миграций; схема analytics.events (ReplacingMergeTree, event_id в ORDER BY, ip_hash, TTL 12 мес) + MV daily_events/sessions/daily_revenue; тест миграций на dev-ClickHouse
- [x] 7.3 POST /api/v1/collect: проверка public key через introspection (кэш), rate limit, bot filter, enrichment (UA parse, IpHasher — только соль-хэш), запись в Redis LIST, ответ 202; feature-тесты 202/401/429 и отсутствия сырого IP
- [x] 7.4 POST /internal/events для сервисов платформы (сервисный токен) + SDK-фасад Analytics::push($key, $history) в cms/shared (буферизованная отправка через очередь, ключи субъектов user:/anon:/admin:); feature-тест приёма события от content и юнит-тест фасада
- [x] 7.4a История пользователя: хронология по ключу субъекта из ClickHouse (ORDER BY с субъектом), admin API GET /projects/{p}/analytics/history/{key} с правами; feature-тест: register → login дают полную хронологию в порядке времени
- [x] 7.5 Демон analytics:flush: батч 5000/2 сек, LTRIM после успешного INSERT, dead-letter при ошибке + команда replay; supervisor-конфиг (один экземпляр); интеграционный тест конвейера и восстановления из dead-letter
- [x] 7.6 Дедупликация: повторный flush батча не дублирует отчёты; тест
- [x] 7.7 Отчётные запросы (Overview, TopPages, Sessions, Revenue) только по MV + admin-контроллеры /projects/{p}/analytics/* с проверкой прав; feature-тесты изоляции по project_id
- [x] 7.8 RollupDailyJob, PruneRawEventsJob, асинхронный ExportReportJob с выдачей файла; тесты
- [x] 7.9 Критерий: конвейер collect→buffer→flush→ClickHouse→отчёт проходит интеграционным тестом через gateway

## 7a. pay-service (логика в packages/cms/pay)

- [x] 7a.1 Подключить cms/shared auth-client + manifest:publish (права pay.*, навигация); contract-тест против фикстур auth-service
- [x] 7a.2 Миграции plans/plan_options/features/plan_feature/payment_intents/payment_transactions/subscriptions/payment_webhook_events/provider_accounts — все с project_id, суммы integer в минорных единицах; тест миграций
- [x] 7a.3 Каталог: CRUD планов, опций, возможностей и связей план↔feature; архивация плана с подписками вместо удаления; публичное API каталога активных планов; feature-тесты
- [x] 7a.4 Интерфейс PaymentProvider + ManualProvider (подтверждение оператором) и NullProvider; конфиг провайдера на проект с шифрованием секретов; юнит-тесты адаптеров
- [x] 7a.5 Единоразовые платежи: создание с Idempotency-Key, статус-машина created→pending→succeeded|failed|canceled в enum, append-only леджер транзакций, refund (полный/частичный) с правом; feature-тесты идемпотентности, переходов и леджера
- [x] 7a.6 Подписки: оформление на план, cancel (до конца периода) / resume / pause / soft-delete; статус-машина в enum; публичное API статуса подписки; feature-тесты всех переходов жизненного цикла
- [x] 7a.7 Автопродление: джоба по расписанию создаёт платёж продления (идемпотентно, очередь critical), при неудаче — проблемный статус и ретраи; тест продления и неуспеха
- [x] 7a.8 Вебхуки POST /webhooks/{provider}: verifyWebhook → INSERT с unique(provider, external_id) → джоба на очередь webhooks → 200 <100 мс; дубль → 200 без эффекта, неверная подпись → 401; feature-тесты
- [x] 7a.9 События payment.*/subscription.* в аналитику через Analytics::push; недоступность аналитики не влияет на платежи; тест с фейковым analytics
- [x] 7a.10 Критерий: сценарий «план → подписка → ручная оплата → отмена → возобновление» проходит интеграционным тестом через gateway, история видна в аналитике; WorkerStateLeakTest

## 7b. Приведение пакетов к канонической DDD-структуре

- [x] 7b.1 Рефакторинг cms/auth, cms/content, cms/analytics (и далее pay) к канонической структуре: Application/DTOs/<Сущность>/*DTO (переименование *Data → *DTO, раскладка по папкам сущностей), Commands+Handlers, Presentation/Http/Api/V1/Controllers; проверка — все тесты пакетов зелёные, grep не находит классов с суффиксом Data в Application

## 8. Swagger, генераторы, frontend-пакеты

- [x] 8.1 Аннотировать контроллеры/ресурсы всех модуль-пакетов swagger-php; генерация openapi.json на сервис; проверить валидность генерации в каждом сервисе
- [x] 8.2 Реализовать `./tools/cms api`: сборка swagger всех сервисов в единый общий файл (коммитится); CI-проверка diff (изменение API без обновлённого файла — красный билд); контрактный тест соответствия ответов документации
- [x] 8.3 Реализовать packages/frontend/api-client: генерация TypeScript-типов и TanStack Query-хуков из единого swagger-файла, регенерация в CI; проверить сборку пакета и типы для эндпоинтов всех сервисов
- [x] 8.4 Создать packages/frontend/ui-kit: извлечь базовые компоненты из frontends/source-admin (строго его дизайн, без изменений стилей) + каркасы фича-пакетов frontend/{auth,content,analytics,pay}; проверить сборку workspaces
- [x] 8.5 Реализовать cms/generators `make:module <name>`: скаффолд пары пакетов — backend (packages/cms/<name>: модуль с манифестом, провайдером, тестами, регистрация в composer) и frontend (packages/frontend/<name>: каркас с подключением api-client); тест: сгенерированный модуль проходит manifest:publish и виден в bootstrap

- [x] 8.6 Создать минимальный каркас frontends/admin (Vite + TanStack Query, подключает frontend/ui-kit и api-client, экран логина как smoke) — чтобы контейнер фронта поднимался в compose и собирался в CI; проверить доступность через gateway

## 9. Эксплуатация, документация, финализация

- [x] 9.1 Horizon и очереди в каждом сервисе (default/media в content, analytics/exports в analytics, critical/webhooks в pay, default в auth), базовые правила джоб (timeout, backoff, failed→audit); smoke-тесты
- [x] 9.2 Обновить STRUCTURE.md под целевую архитектуру (тонкие apps/, packages/cms и packages/frontend, infra/ по сервисам, tools/cms, gateway, introspection) и написать README; проверить, что новый разработчик поднимает стек по README через tools/cms
- [x] 9.3 Финальный интеграционный прогон: bootstrap отдаёт манифест с четырьмя сервисами и правами, изоляция двух проектов сквозная (auth+content+analytics+pay), `./tools/cms api` собирает актуальный swagger, полный CI зелёный
