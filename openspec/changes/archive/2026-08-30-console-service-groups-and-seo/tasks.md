## 1. Лицензирование под тумблером оплаты

- [x] 1.1 Убрать `licensing` из `ServiceName::toggleable()` и из `default_enabled_services` в `packages/cms/auth/config/cms-auth.php`, поправить enum сервиса в OpenAPI-атрибуте `ServiceController`; проверка — `php artisan test` auth-service: список сервисов проекта отдаёт три строки, переключение `licensing` отклоняется
- [x] 1.2 Перевести `packages/cms/licensing/routes/admin.php` на `EnsureServiceEnabled:pay`; проверка — тест licensing: при выключенном `pay` admin-маршруты отдают 404, при включённом работают как прежде
- [x] 1.3 Добавить миграцию в `cms/auth`: проектам со строкой `project_services(licensing, enabled = true)` включить `pay` (вставкой или обновлением), строки `licensing` не удалять; проверка — тест миграции на проекте с выключенным `pay` и включённым `licensing`
- [x] 1.4 Обновить `LicensingManifest`: четыре `NavigationItem` (`license-plans`, `licenses`, `organizations`, `releases`) вместо одного; проверка — `LicensingManifestTest` ждёт четыре пункта с правом `pay.licensing.view`
- [x] 1.5 Обновить `packages/cms/licensing/tests` и `PayManifestLicensingTest` под новый гейт и манифест; проверка — `php artisan test` pay-service и licensing зелёные

## 2. Каталог SEO в content-сервисе

- [x] 2.1 Добавить `ListProjectSeoQuery` в `cms/content`: `UNION ALL` по постам, страницам и категориям с `LEFT JOIN seo_meta`, отбор по типу сущности, сортировка по типу/названию/дате изменения, постраничная навигация; проверка — unit-тест запроса на проекте с заполненным и пустым SEO
- [x] 2.2 Добавить `Application/DTOs/Seo/SeoCatalogItemDTO.php` и `SeoCatalogFilterDTO.php`, `Presentation/.../Requests/Seo/ListSeoCatalogRequest.php` (тип, сортировка, страница) и `Resources/Seo/SeoCatalogItemResource.php` + коллекцию; проверка — снимок ответа в тесте контроллера
- [x] 2.3 Добавить `SeoCatalogController` и маршрут `GET content/seo` под правом `content.seo.manage` и гейтом `content`; проверка — feature-тест: 200 с правом, 403 без права, 404 при выключенном сервисе, чужой проект в ответ не попадает

## 3. Пересборка SEO по AI

- [x] 3.1 Добавить `BackgroundTaskKind::SeoRebuild` в `cms/shared`; проверка — тест перечисления и отдача задачи списком `content/tasks` по `kind=seo_rebuild`
- [x] 3.2 Расширить схему инструкции `InstructCategory::PostSeo` в `SystemInstructCatalog` полями `og_title`, `og_description`, `twitter_card` и добавить категорию `CategorySeo` с инструкцией по умолчанию; проверка — тест каталога системных инструкций и обновлённый тест пересборки поста
- [x] 3.3 Добавить `ComposeCategorySeoAction` в `cms/research` (вход — название и описание категории) по образцу `ComposePostSeoAction`; проверка — unit-тест с фейковым `AiOperations`
- [x] 3.4 Добавить `RebuildSeoCommand` + `StartSeoRebuildHandler` (запись задачи до `dispatch`, `subject_type = 'project'`, отказ 422 при выполняющейся задаче) и `RebuildSeoJob` (project_id, список сущностей, task_id); проверка — тест: вторая постановка даёт 422, job не создаётся
- [x] 3.5 В `RebuildSeoJob` писать только текстовые SEO-поля (`title`, `description`, `keywords`, `og_title`, `og_description`, `twitter_card`), отказ по сущности заносить в прогресс и продолжать, `failed()` — в аудит; проверка — тест: отказ AI по одной сущности не затирает её прежние поля и не роняет задачу
- [x] 3.6 Добавить `SeoRebuildController` и маршрут `POST content/seo/rebuild` в `cms/research` под правом `content.seo.manage`; проверка — feature-тест на запуск для перечисленных сущностей и для всех

## 4. Списки оплаты

- [x] 4.1 Добавить отбор по `subject_type` в `ListSubscriptionsQuery` через `ListSubscriptionsRequest` → DTO; проверка — тест: отбор по типу предмета оставляет только подписки на планы лицензий
- [x] 4.2 Добавить отбор по статусу в `ListPaymentsQuery` через `ListPaymentsRequest` → DTO; проверка — тест отбора и снимок ответа списка платежей
- [x] 4.3 Пересобрать спецификацию (`./tools/cms api`) после изменения маршрутов и параметров; проверка — сборка проходит, новые эндпоинты присутствуют

## 5. Каталог разделов консоли

- [x] 5.1 Обновить `CONSOLE_SECTION_KEYS` и `SECTION_REQUIREMENTS` в `lib/admin/data-source/section-access.ts`: добавить `payments`, `subscriptions`, `plans`, `license-plans`, `licenses`, `organizations`, `releases`, `seo`, убрать `licensing`; проверка — node-тесты `section-access` на видимость по сервису и праву
- [x] 5.2 Переписать группы в `lib/admin/sidebar-config.ts`: «Обзор», «Контент» (Блог, Категории, Ресёрч, Инструкции, SEO), «Оплата» (Транзакции оплат, Подписки, Тарифные планы, Тарифные планы лицензий, Лицензии, Организации, Релизы), «Рабочее пространство» (Клиенты, Команда, Настройки); проверка — тест сборки меню по снимку доступа
- [x] 5.3 Добавить ключи `console.nav.*` и `console.nav.group.*` для новых разделов и групп в `lib/admin/console-texts.ts`; проверка — тест реестра текстов: у каждого пункта меню есть русский текст

## 6. Экраны оплаты в консоли

- [x] 6.1 Перенести из склада `frontends/source-admin` части таблицы транзакций (`components/pages/orders/*`) и собрать раздел `/admin/payments`: список платежей с суммой, статусом, провайдером и датой; проверка — раздел открывается и показывает данные платформы, перенесённые файлы совпадают со складом побайтово
- [x] 6.2 Добавить действия подтверждения и возврата платежа с показом отказа платформы; проверка — действия недоступны без прав `pay.payments.confirm|refund`, отказ виден оператору сообщением
- [x] 6.3 Собрать раздел `/admin/subscriptions`: список подписок с предметом и его типом, отбор по типу предмета, действия оператора при праве `pay.subscriptions.manage`; проверка — отбор оставляет только подписки на планы лицензий
- [x] 6.4 Собрать раздел `/admin/plans`: планы подписок с созданием, правкой и архивированием при праве `pay.plans.manage`; проверка — планы лицензий в разделе не появляются
- [x] 6.5 Добавить слой данных разделов оплаты (`lib/admin/services`, `hooks/admin/*`, ключи запросов); проверка — node-тесты слоя данных на разбор ответов платформы

## 7. Разделы лицензирования

- [x] 7.1 Разнести `components/pages/licensing/sections/*` по страницам `app/admin/{license-plans,licenses,organizations,releases}` с собственными `PageHeader`, удалить `app/admin/licensing` и обёртку вкладок; проверка — каждый раздел открывается своим адресом, `/admin/licensing` больше не существует
- [x] 7.2 Обновить хлебные крошки и тексты разделов лицензирования на группу «Оплата»; проверка — крошки ведут в «Оплата», тексты берутся из `console.*`

## 8. Раздел SEO в консоли

- [x] 8.1 Собрать страницу `/admin/seo`: таблица со всеми SEO-полями, колонки типа и названия сущности, отбор по типу и сортировка; проверка — незаполненные записи видны и отличимы от заполненных
- [x] 8.2 Добавить правку SEO-записи из раздела через существующий `PUT content/seo/{type}/{id}` с показом ошибок платформы, включая неверный JSON-LD; проверка — прежние значения не затираются при ошибке
- [x] 8.3 Добавить запуск пересбора по AI для выбранных строк и для всех записей с показом хода задачи через `useTasksQuery({kind: 'seo_rebuild'})`; проверка — перезагрузка страницы во время задачи снова показывает её ход, повторный запуск недоступен
- [x] 8.4 Добавить слой данных раздела SEO и ключи текстов `console.seo.*`; проверка — node-тесты слоя данных, тексты на русском

## 9. Карточка проекта в настройках

- [x] 9.1 Вывести идентификатор проекта с копированием сверху раздела «Основные» (`components/pages/settings/sections/GeneralSection.tsx`); проверка — идентификатор виден над полями и копируется одним действием
- [x] 9.2 Перенести `BuildoutPanel` в раздел «Основные» и подключить к `useProjectBuildoutQuery`/`useStartProjectBuildoutMutation`; проверка — запуск сборки работает при выключенном сервисе аналитики, повторный запуск недоступен, отказ виден оператору
- [x] 9.3 Удалить `components/pages/dashboard/sections/ProjectCard/` и её использование на дашборде; проверка — дашборд открывается без карточки проекта, `data-testid="project-card"` больше не встречается

## 10. Проверки перед сдачей

- [x] 10.1 `./vendor/bin/pint --test ../../packages/cms app` в затронутых сервисах — кодстайл зелёный
- [x] 10.2 `./vendor/bin/phpstan analyse --memory-limit=1G` в затронутых сервисах — Larastan level 8 без ошибок
- [x] 10.3 `php artisan test` в auth-, content- и pay-сервисах — Pest зелёный
- [x] 10.4 `./tools/refactor-inventory.sh --strict` — канон слоёв соблюдён
- [x] 10.5 Пересобрать `admin-front` и пройти сценарии: включение и выключение `pay` и `content` показывает и скрывает группы целиком; проверка — разделы появляются без повторного входа, прямые адреса скрытых разделов ведут на страницу отказа
