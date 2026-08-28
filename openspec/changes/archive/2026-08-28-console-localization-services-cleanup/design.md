# Design — console-localization-services-cleanup

## Context

См. proposal.md. Факты разведки, на которых строятся решения:

- `frontends/admin/src/{components,app}` **побайтово идентичны** `frontends/source-admin/src/*` (инвариант спеки admin-console); платформенные отличия — только 41 файл в `src/lib`, `src/hooks`, `src/proxy.ts`.
- Механизма локализации панели нет: ни i18n-зависимостей, ни словарей. Все тексты — хардкод: заголовки в `PageHeader`-вызовах, пункты меню в `lib/admin/sidebar-config.ts`, колонки в 11 файлах `*columns*`, тосты/диалоги/пустые состояния россыпью, ошибки API в `data-source/api-client.ts` (`messageFor`), сообщения входа в `data-source/session.ts`, zod-сообщения в `lib/admin/schemas/**`.
- Бэкенд локализации готов и не используется фронтом: `GET .../content/translations?locale=` отдаёт плоский `{key: value}` с откатом на локаль по умолчанию; `bootstrap.translations_version` есть в `BootstrapDTO`, но отсутствует во фронтовом `PlatformBootstrap`; `bootstrap.user.locale` фронтом игнорируется (`session.ts::toOperatorProfile`).
- Сервис-гейтинг навигации работает: `section-access.ts::visibleSectionKeys()` фильтрует по `bootstrap.services[].enabled` + правам; снапшот `console_sections` (cookie+localStorage) пишется `rememberSectionSnapshot()` при входе и в `getBootstrap`. UI-галочек нет: `projectServices.{list,toggle}` реализованы в `lib/admin/services/content-domain/settings.ts` и **не импортируются ни одним компонентом**. Переключаемые сервисы на бэке: `ServiceName::toggleable()` → `content|analytics|pay`; `auth` — ядро.
- Категории: `CategoriesStats` (4 карточки, считаются на клиенте из списка категорий; в api-режиме `revenue/growthYoY/productCount` всегда 0), колонки `Revenue`/`Growth YoY` в `category-columns`, блок «Sales Revenue» в `category-card`, обязательные `revenue`/`growthYoY` в `category-form-schema.ts` и полях формы `pages/add/sections/visual`, долларовые блоки PDF (`lib/admin/categories/pdf/*`) и превью.
- Дашборд: KPI/график выручки/топ-страницы/категории — реальные; `bestSellers`, `lowStock`, `recentOrders`, `campaigns`, `brands` — жёстко демо. KPI-карточки blogs/customers: `delta`/`trend` — константы в коде; customers дополнительно `tier: "SILVER"`, `totalSpent: 0` → карточки CLV/VIP всегда пустые по сути.
- Правила переноса вёрстки: `.ai/skills/source-copy` — «ничего не добавлять, менять только тексты/пути/синтаксис»; новые экраны собираются из существующих компонентов (`.ai/skills/frontend-source-integration`, memory «Экран ролей — из существующих компонентов»).

## Goals / Non-Goals

**Goals:** оператор видит консоль на русском во всех разделах, которые уже подключены к живым сервисам платформы (dashboard, blogs, categories, customers, team, settings); администратор управляет сервисами галочками, сайдбар отражает выбор сразу; живые разделы показывают только реальные данные платформы.

**Non-Goals:**
- русификация скрытых демо‑разделов (products, orders, inventory, promotions, campaigns, support, notifications, brands, collections, variants — `isDemoSection`);
- любые правки в `frontends/source-admin` (эталонная вёрстка остаётся без изменений);
- перевод контента проектов; добавление новых бэкенд‑эндпоинтов; полноценный i18n‑фреймворк (next‑intl и т.п.);
- экраны, которых нет в шаблоне.

## Decisions

1. **Реестр текстов — один модуль `lib/admin/console-texts.ts`, а не i18n-библиотека.** Плоская карта `{ 'console.nav.dashboard': 'Дашборд', ... }` + функция `t(key)` и хук `useConsoleText()`. Русские значения — значения по умолчанию прямо в реестре (single source of truth, типизированные ключи). Никаких новых зависимостей — это соответствует запрету на самописные обёртки поверх фреймворка и правилу source-copy «менять только тексты».
2. **Словарь проекта — слой переопределения, не источник по умолчанию.** При старте панель запрашивает `listTranslations`-плоскую выдачу (`?locale=<bootstrap.user.locale>`), отбирает ключи с префиксом `console.` и накладывает поверх реестра. Кэш в localStorage с ключом, включающим `translations_version` из bootstrap (поле добавляется в `PlatformBootstrap` вместе с `user.locale`). Сбой запроса/выключенный content → работаем на дефолтах (сценарий спеки). Так «каждый текст переводится на свой язык» через существующую таблицу, а русский не требует сидирования БД.
3. **Замена строк в компонентах — механическая: литерал → `t('console.<раздел>.<ключ>')`.** Затрагиваются только видимые поверхности `frontends/admin` для живых разделов: каркас (sidebar-config, topbar, login, unauthorized, футер), dashboard, blogs, categories, customers, team, settings (включая вкладки), диалоги/тосты/пустые состояния этих разделов, `api-client.ts::messageFor`, `session.ts`, zod‑сообщения схем живых форм, метаданные страниц живых маршрутов. Демо‑разделы не трогаются. `frontends/source-admin` не меняется.
4. **Вкладка «Сервисы» — восьмая вкладка Settings из существующих компонентов.** `SettingsSection` + `SettingsToggleRow` (уже используются соседними вкладками) + `projectServices.list/toggle`. `auth` не отображается в переключаемых (бэк его и не отдаёт в toggleable); строки — из реестра текстов. Право: наличие `auth.services.manage` в `bootstrap.permissions` → переключатели активны, иначе disabled (просмотр — раздел settings уже гейтится `auth.settings.view`).
5. **Мгновенное отражение в сайдбаре — повторный `getBootstrap()` после успешного toggle.** `getBootstrap` уже вызывает `rememberSectionSnapshot`; остаётся инвалидировать react-query кэш bootstrap и перечитать `useVisibleNavigation` (снимок читается из localStorage — после обновления снапшота триггерится ре-рендер через существующий механизм; если его нет — добавить лёгкое событие/refetch в хук, не меняя вёрстку сайдбара).
6. **Категории: демонтаж долларовых фрагментов, а не их русификация.** Убираются: рендер `CategoriesStats` из `categories/index.tsx`; колонки `Revenue`/`Growth YoY` из `category-columns` (Product Count остаётся — не деньги, но показывает 0: заменяется на колонку, которой у платформы есть данные — например «Вложенные категории» из `children`, решение за реализацией из имеющихся данных `PlatformCategory`); блок Sales Revenue из `category-card`; поля Revenue/Growth из формы add и из `category-form-schema.ts` (поля становятся необязательными для мок-режима либо схема разводится — форма живого режима без них); долларовые блоки PDF-шаблона; превью. Файлы компонентов `categories-stats/*` остаются в дереве (шаблон), но не рендерятся живой страницей — как уже сделано для демо-разделов («скрыт, но сохранён»).
7. **Дашборд: состав секций — только реальные.** `AdminDashboardClient` рендерит `DashboardHeader`, `QuickActions`, `KpiCards`, `RevenueChart`, топ-страницы; демо-секции (`RecentOrders`, `LowStock`, `BestSellers`, `CampaignPerformance`, `BrandPerformance`, `CategorySales` с нулевой выручкой) из живой страницы убираются. «Свежие материалы» — существующий `DataGrid` поверх реальных постов (`listPosts`), в стиле `RecentOrders`. Компоненты шаблона не удаляются.
8. **KPI живых разделов — честные значения.** blogs: 4 карточки остаются (значения считаются из реальных данных), захардкоженные `delta`/`trend` убираются (KpiStatCard позволяет их не передавать). customers: карточки `Average CLV` и `VIP Tier Ratio` (данных нет) заменяются метриками из реальных полей (всего пользователей, активные/заблокированные, новые за период — из `listProjectUsers`); `tier: "SILVER"`-заглушка из маппера уходит вместе с потребителями.
9. **Гейты.** Node‑тесты: реестр текстов (все ключи имеют русские значения; `t()` падает на неизвестный ключ типом), section‑access (обновление снапшота после toggle). e2e: `console-navigation.spec.ts` дополняется сценарием переключения из UI; `localization.spec.ts` — проверкой русских текстов и переопределения через словарь. Сравнение с `frontends/source-admin` не требуется.

## Risks / Trade-offs

- [Массовая замена строк затронет снапшоты e2e/скриншоты] → e2e ассерты на тексты обновляются в тех же задачах; шаблонные разделы не трогаются, их тесты не задеты.
- [«Побайтовая копия» ломается при рассинхроне правок] → правки выполняются парно, гейт `diff -r frontends/admin/src/components frontends/source-admin/src/components` (и `src/app`) — в каждой задаче раздела.
- [Словарь per-project: оператор без проекта/при выключенном content] → дефолты реестра покрывают всё; спека фиксирует сценарий недоступности.
- [Категории: удаление обязательных полей схемы может сломать мок-режим формы] → схема разводится: базовая (живой режим) без денежных полей; мок-режим шаблона использует прежнюю — проверяется node-тестом схемы и ручным прогоном формы в mock.
- [Обновление сайдбара «сразу» зависит от реактивности снапшота] → если `useVisibleNavigation` не ре-рендерится на обновление localStorage, добавляется подписка на событие в хук (lib-слой, не вёрстка) — решение остаётся вне компонентов шаблона.

## Migration Plan

Только фронтенд `frontends/admin`, бэкенд не меняется. Выкатка обычная (`admin-front` пересобирается). Откат — git revert. Словарь БД не сидируется — отката данных нет. Эталон `frontends/source-admin` не модифицируется.

## Open Questions

Нет. Зафиксированные предположения — в proposal (Impact).
