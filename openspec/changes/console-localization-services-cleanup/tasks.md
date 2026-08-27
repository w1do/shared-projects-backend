# Tasks — console-localization-services-cleanup

Гейт каждого раздела: `cd frontends/admin && npm test` зелёный. Компоненты шаблона не удаляются и не добавляются — только существующие; строки меняются через реестр текстов. `frontends/source-admin` не затрагивается.

## 1. Механизм локализации

- [x] 1.1 Ввести реестр текстов `frontends/admin/src/lib/admin/console-texts.ts`: типизированные ключи `console.*` с русскими значениями по умолчанию; функция `t(key)` и React-хук с контекстом переопределений; node-тест — каждый ключ имеет непустое русское значение, неизвестный ключ не компилируется (типизация). Проверить: `npm test`.
- [x] 1.2 Расширить `PlatformBootstrap` (`lib/admin/data-source/platform/types.ts`) полями `translations_version` и `user.locale`; прокинуть локаль в `session.ts::toOperatorProfile`. Проверить node-тестом маппинга bootstrap.
- [x] 1.3 Загрузка переопределений: запрос плоского словаря текущего проекта по локали оператора (`?locale=`, существующая ручка translations), отбор ключей `console.*`, кэш в localStorage с `translations_version` в ключе; при сбое/выключенном content — молча дефолты. Проверить node-тестом: переопределение применяется, сбой не ломает `t()`.

## 2. Русификация видимых поверхностей

Каждая задача: заменить хардкод-строки на `t('console...')`, добавить ключи в реестр — только в `frontends/admin`.

- [x] 2.1 Каркас: `lib/admin/sidebar-config.ts` (группы, пункты, быстрые действия), `AdminTopbar`, `AdminFooter`, `NotificationsBell`, `SupportQuickMenu`, экраны `login` (`auth/*`) и `unauthorized`, метаданные живых маршрутов `app/admin/*/page.tsx`. Проверить: сайдбар и логин на русском (e2e-смоук `localization.spec.ts`).
- [x] 2.2 Общие lib-строки: `data-source/api-client.ts::messageFor` (ошибки API), `data-source/session.ts` (вход), тексты `capabilities.ts`/`settings.ts` «нет аналога в платформе». Проверить node-тестом messageFor.
- [x] 2.3 Dashboard: `DashboardHeader`, `QuickActions`, подписи `KpiCards`, `RevenueChart`, заголовки колонок таблицы свежих материалов. Проверить визуально + e2e-текст.
- [x] 2.4 Blogs: `blogs-stats`, `blogs-panel`, `blogs-featured`, диалоги/превью, формы add/edit, пустые состояния, zod-сообщения `blog`-схем. Проверить существующими e2e content-management (ассерты текстов обновить в этой же задаче).
- [x] 2.5 Categories: header (описание без «sales metrics»), toolbar, колонки, диалоги move/delete, форма, тосты экспорта, `emptyMessage`, zod-сообщения `category-form-schema`. Проверить e2e category-tree (ассерты обновить здесь же).
- [x] 2.6 Customers и Team: stats/panel/columns/диалоги обеих страниц. Проверить визуально + node-тесты, e2e-навигация.
- [x] 2.7 Settings (все 7 вкладок + shared `SettingsSection`/`SettingsToggleRow`) и вкладка Languages (`LanguagesSection`: «Project locales», «Translation dictionary», «Translate missing», плейсхолдеры, колонки). Проверить e2e `localization.spec.ts` (ассерты обновить здесь же).
- [x] 2.8 Сценарий переопределения: e2e — добавить в словарь проекта ключ `console.*` с другим значением, перезайти, увидеть значение из словаря; убрать — вернулся дефолт. Проверить: тест зелёный.

## 3. Управление сервисами

- [x] 3.1 Вкладка «Сервисы» в Settings (восьмая, из `SettingsSection`+`SettingsToggleRow`): список из `projectServices.list()` (только переключаемые; auth не отображается), переключатели с optimistic-откатом при ошибке и тостом; переключатели disabled без `auth.services.manage` в `bootstrap.permissions`. Тексты — из реестра. Проверить: галочка сохраняется через перезагрузку (e2e).
- [x] 3.2 Мгновенное отражение: после успешного `toggle` — повторный `getBootstrap()` (обновляет снапшот `console_sections`) + инвалидация bootstrap-кэша; при необходимости — подписка `useVisibleNavigation` на обновление снапшота (только lib-слой). Проверить node-тестом section-access + e2e: выключение content из UI мгновенно убирает Blogs/Categories из меню и быстрых действий, включение возвращает.
- [x] 3.3 e2e `console-navigation.spec.ts`: сценарий переключения из UI вместо/в дополнение к `withServiceDisabled`-обходу через API. Проверить: сюита зелёная.

## 4. Чистка категорий

- [x] 4.1 Убрать рендер `CategoriesStats` со страницы категорий (компонент остаётся в дереве — «скрыт, но сохранён»); убрать колонки `Revenue` и `Growth YoY` из `category-columns`; колонку `Product Count` заменить на показатель из реальных данных (`children`-счётчик) или убрать; блок «Sales Revenue» из `category-card`. Проверить: страница категорий без долларов и карточек, e2e категорий зелёные.
- [x] 4.2 Форма категории: убрать поля `Revenue ($)`/`Growth YoY (%)` из `pages/add/sections/visual` и превью; развести `category-form-schema` — живой режим без денежных полей, мок-режим шаблона не ломается. Проверить node-тестом схемы + создание категории в обоих режимах.
- [x] 4.3 PDF-отчёт категорий: убрать долларовые блоки (`Combined Revenue`, `Revenue Distribution`, колонка Revenue) из `lib/admin/categories/pdf/*`, тосты экспорта — на русский. Проверить генерацией PDF на живых данных.

## 5. Релевантные данные разделов

- [x] 5.1 Dashboard: из живой страницы убрать демо-секции (`RecentOrders`, `LowStock`, `BestSellers`, `CampaignPerformance`, `BrandPerformance`, `CategorySales`); добавить «Свежие материалы» — существующий `DataGrid` поверх реальных `listPosts` (по образцу RecentOrders). Проверить: дашборд только с реальными секциями, e2e-смоук.
- [x] 5.2 Blogs KPI: значения из реальных данных, захардкоженные `delta`/`trend` не передавать. Проверить визуально + node-тест хелпера подсчёта.
- [x] 5.3 Customers: карточки `Average CLV`/`VIP Tier Ratio` заменить метриками из реальных полей (`всего`, `активные/заблокированные`, `новые за 30 дней`); убрать заглушку `tier: "SILVER"` из маппера вместе с потребителями. Проверить node-тестом маппера + визуально. _(вместо «новые за 30 дней» — «доля активных»: платформа не отдаёт `created_at` пользователей, а бэкенд по плану не меняется)_

## 6. Финализация

- [x] 6.1 Полный гейт: `npm test` (admin), `diff -r` обоих каталогов пуст, e2e-сюиты (`console-navigation`, `localization`, `content-management`, `category-tree-dnd`) зелёные против поднятого стека, `bun run build` панели собирается.
- [x] 6.2 Обновить `docs/admin-console.md`: язык консоли, механизм `console.*`-переопределений, вкладка «Сервисы», актуальные таблицы «раздел → данные» (дашборд/категории/customers после чистки).
