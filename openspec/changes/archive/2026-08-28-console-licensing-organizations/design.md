# Design: console-licensing-organizations

## Context

Мотивация — в proposal.md (Why). Текущее состояние, определяющее подход:

- Реестр переключаемых сервисов — enum `ServiceName::toggleable()` (`packages/cms/auth/src/Domain/Enums/ServiceName.php`) → `config('cms-auth.services')`; сейчас `content|analytics|pay`. Состояние — таблица `project_services` (auth-service), API `GET/PUT /api/admin/v1/projects/{project}/services*`, `ToggleServiceHandler` отвергает неизвестные ключи.
- Механизма «включён по умолчанию» не существует: `CreateProjectHandler` не создаёт строк `project_services`, свежий проект имеет все сервисы выключенными (демо-окружения включают их HTTP-вызовами: `tools/smoke.sh`, `e2e/support/platform.ts`).
- Навигация консоли собирается из **опубликованных манифестов** (`ServiceNavigationQuery` пропускает манифесты сервисов, не включённых в проекте). У лицензирования манифеста нет: права `pay.licensing.view|manage` объявлены в `PayManifest` (группа `licensing`), навигационных пунктов нет.
- Admin-маршруты модуля (`packages/cms/licensing/routes/admin.php`, префикс `.../pay/licensing/*`) гейтятся `EnsureServiceEnabled:pay`. Публичная валидация `POST /api/v1/pay/licensing/validate` сервисом не гейтится (throttle only).
- Фронтенд: видимость разделов — `SECTION_REQUIREMENTS` в `frontends/admin/src/lib/admin/data-source/section-access.ts` + `bootstrap.services[]`; меню — `lib/admin/sidebar-config.ts`; экран «Сервисы проекта» — `components/pages/settings/sections/ServicesSection.tsx` с жёсткой картой `SERVICE_TEXTS`. Всё под `src/app/`/`src/components/` побайтово зеркалируется admin ↔ source-admin; API-обвязка (`data-source/platform/*`) — только в admin.
- Admin API лицензирования полный (организации CRUD, планы+фичи, лицензии выпуск/отзыв/файл, signing-key); списки — cursor-пагинация, у организаций/планов нет фильтров, `per_page = 50`.

## Goals / Non-Goals

**Goals:**

- `licensing` — полноправный сервис реестра: переключается штатно, имеет манифест и навигацию, гейтит свои маршруты, включён по умолчанию везде.
- Консольный раздел, полностью покрывающий существующий admin API модуля, без изменений этого API.
- Ноль переименований прав и ноль изменений wire-контрактов.

**Non-Goals:**

- Поиск/фильтры для списков организаций и планов на бэкенде (консоль живёт с cursor-пагинацией как есть).
- Экраны подписок/интеграции «подписка → лицензия» в консоли (лицензии, выпущенные подпиской, видны в общем списке — этого достаточно).
- Перенос licensing-маршрутов с префикса `/pay/licensing/*` (Caddyfile и swagger-пути не трогаем).
- Автоперевод текстов раздела; только русские значения по умолчанию в реестре `console.*`.

## Decisions

**Д1. Отдельный ключ сервиса `licensing`, а не «подключение к pay».**
Добавляем `case Licensing = 'licensing'` в `ServiceName` и ключ в `toggleable()`. Альтернатива — оставить гейт по `pay` и показывать раздел при включённом pay — отвергнута: пользовательское требование именно про отдельный тумблер в «Сервисах проекта».

**Д2. Манифест лицензирования — навигация без прав; права остаются в `PayManifest`.**
Новый `LicensingManifest` (по образцу `PayManifest`, в корне `src/` пакета licensing) с ключом `licensing`, версией и nav-пунктом раздела (required permission `pay.licensing.view`); группа прав `licensing` остаётся объявленной в `PayManifest` — имена `pay.licensing.*` сохраняются, роли и снимки не трогаются. Альтернативы: перенести группу прав в LicensingManifest (риск споткнуться о валидацию соответствия имён ключу манифеста и лишние движения при том же результате) или переименовать права в `licensing.*` (**BREAKING** для ролей и снимков) — отвергнуты. Публикация — той же командой `manifest:publish` пакета (аналог `PublishManifestCommand` licensing регистрирует у себя), вызывается везде, где публикуются остальные манифесты (entrypoint/скрипты стека — найти по вызовам существующих команд публикации).

**Д3. Смена гейта маршрутов: `EnsureServiceEnabled:pay` → `EnsureServiceEnabled:licensing`** в `packages/cms/licensing/routes/admin.php` (одно место — замыкание `$authorize`). Публичный `validate` не гейтится сервисом (см. спек `licensing/service-registration`): выключение тумблера не должно ломать проверку лицензий, уже живущих в поставках клиентов.

**Д4. «Включён по умолчанию» = конфиг-список + сидинг при создании проекта + бэкфилл-миграция.**
В `cms-auth.php` — `'default_enabled_services' => [ServiceName::Licensing->value]`; `CreateProjectHandler` после создания проекта создаёт строки `project_services (enabled = true)` для этого списка; data-миграция auth-service вставляет строку `licensing/enabled=true` каждому проекту, у которого строки с этим ключом ещё нет (идемпотентно; явное выключение после релиза — это существующая строка `enabled=false`, миграция её не тронет). Альтернатива «нет строки = включён» (инверсия семантики в `Project::enabledServices()`) отвергнута: меняет смысл данных для всех сервисов и опасна для введения будущих ключей. Инвалидация кэшей: публикация манифеста лицензирования и первый же `ToggleService`/bootstrap-bump покрывают консоль; introspection-кэш доживает свой TTL — приемлемо.

**Д5. Фронтенд: секция `licensing` со страницей `/admin/licensing` и тремя вкладками.**
- `section-access.ts`: ключ `licensing` в `CONSOLE_SECTION_KEYS`, `SECTION_REQUIREMENTS.licensing = { service: "licensing", permission: "pay.licensing.view" }`.
- `sidebar-config.ts`: пункт «Лицензирование» в группе commerce (рядом с коммерческими разделами), `url: /admin/licensing`, `section: "licensing"`.
- Страница: `app/admin/licensing/page.tsx` → `components/pages/licensing/` (index + `sections/OrganizationsSection|PlansSection|LicensesSection` + модалки), вкладки — как в settings (`Tabs`). Экраны собираются строго из существующих компонентов вёрстки (таблицы, диалоги, формы settings/customers) — новых элементов дизайн-системы не появляется.
- Управление правом: `canManage = permissions.includes("*") || includes("pay.licensing.manage")` (образец — `use-project-services.ts`); без manage скрываем/блокируем изменяющие действия, включая скачивание файла и ключ подписи (бэкенд их и так закрывает manage'ем).
- Данные: `data-source/platform/licensing.ts` (только admin-дерево) с путями от `PAY_BASE + "/licensing"`; фасад в `services/`, hooks `hooks/admin/licensing/*` на TanStack Query, ключи в `lib/admin/query/keys.ts`. Скачивание `.lic` — авторизованный fetch → blob → objectURL (ссылкой скачать нельзя: нужен Bearer/cookie-заголовок).
- `ServicesSection.tsx`: `licensing` в `SERVICE_TEXTS`; тексты `console.settings.services.licensing.*` и весь блок `console.licensing.*` — в `console-texts.ts`.
- Зеркалирование: все новые файлы `src/app/**` и `src/components/**` кладутся побайтово одинаково в `frontends/admin` и `frontends/source-admin`; `section-access.ts`, `sidebar-config.ts`, `console-texts.ts` — тоже зеркалируемые (`src/lib` различия допустимы только в списке известных admin-only файлов — новые общие правки держим идентичными); `platform/licensing.ts`, фасад и hooks c запросами — только в admin? Нет: hooks зеркалируются, если их пары уже есть в source-admin (`hooks/admin/settings/*` идентичны) — держим идентичными, а расходящейся оставляем только `data-source/platform/**`.

**Д6. Тесты.**
Бэкенд: юнит на `ServiceName::toggleable()`/дефолты, тест `CreateProjectHandler` (сидинг), feature-тест гейта (licensing off → 404, независимость от pay), тест бэкфилл-миграции; переснять снимки `RouteCoverageTest`/характеризационные pay-service, если фиксируют middleware. Фронтенд: `section-access.test.ts` (новая секция), `console-texts.test.ts` (реестр ключей), e2e `console-navigation.spec.ts` — «Лицензирование» в `VISIBLE`; проверить `tools/smoke.sh` (явное включение licensing не нужно, но и не вредит).

## Risks / Trade-offs

- [Манифест не опубликован в окружении → раздел не появляется, хотя сервис включён] → найти все места вызова `manifest:publish` (entrypoint стека, smoke, e2e-support) и добавить licensing; e2e-сценарий навигации это поймает.
- [Валидация манифеста в auth-service может требовать соответствия прав/навигации ключу манифеста (`pay.licensing.view` в манифесте `licensing`)] → проверить `PublishManifestHandler`/валидатор в начале реализации; если строго — оставить nav-требование права как есть, но при необходимости объявлять группу прав в обоих манифестах не потребуется: право уже существует в реестре из PayManifest.
- [Смена middleware ломает снимки маршрутов/характеризационные тесты pay-service] → переснять снимки в рамках задачи, прогнать полный тестовый набор pay-service.
- [Бэкфилл-миграция не пишет audit-записи о включении] → осознанный компромисс: массовое включение при релизе — не действие оператора; фиксируется в migration-файле.
- [Тесты auth-service, полагающиеся на «новый проект без сервисов»] → обновить ожидания на «licensing включён по умолчанию».
- [Разрастание зеркалируемых файлов (`sidebar-config`, `section-access`, `console-texts` меняются в обоих деревьях)] → следовать существующей практике: после правок сверять `diff -rq frontends/admin/src frontends/source-admin/src` — расхождения только в известном admin-only списке.

## Migration Plan

1. Бэкенд: enum/конфиг/дефолты + `LicensingManifest` + смена гейта + бэкфилл-миграция; `./tools/cms migrate`, публикация манифестов, пересборка swagger не требуется (пути не меняются).
2. Фронтенд: секция, тумблер, тексты, hooks; пересборка admin-front (restart контейнера).
3. Проверка: bootstrap отдаёт `licensing`, раздел виден, тумблер выключает его вживую; smoke + e2e.
4. Откат: revert кода; строки `project_services.licensing` безвредны (неизвестный ключ игнорируется `ListServiceStatusesQuery`, который итерирует конфиг).

## Open Questions

Нет — размещение пункта меню (группа commerce) и состав вкладок зафиксированы решениями Д5; всё остальное определяется существующими контрактами API.
