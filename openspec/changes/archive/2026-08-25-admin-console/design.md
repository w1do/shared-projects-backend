# Design: admin-console

## Context

Источник — `frontends/source-admin`: Next.js 16 (App Router), React 19, Tailwind v4, radix/shadcn-компоненты, ApexCharts, GSAP, `bun.lock`. В `next.config.ts` уже есть редирект `/` → `/admin`. Разделы (`app/admin/<section>/page.tsx`) рендерят `components/pages/<section>`.

Критично: вёрстка **уже спроектирована под бекенд**. В `src/lib/admin/data-source/` лежат:
- `config.ts` — переключатель `NEXT_PUBLIC_ADMIN_DATA_SOURCE=mock|api`, `adminApiConfig` (baseUrl, username, password);
- `api-client.ts` — HTTP-клиент со своим контрактом: конверт `{success, data, error{code,message}}`, страницы `{items,page,size,totalItems,totalPages}`, логин `POST /api/v1/auth/login` с `{username,password}` → `{accessToken}`;
- `queries/`, `mutations/`, `mappers/`, `api-types/` — чтение/запись и приведение к типам вёрстки;
- `admin-data.ts` — единая точка, из которой страницы берут данные (mock или api).

Наш backend отдаёт другой контракт: `{data: ...}` без `success`, курсорную пагинацию (`meta.next_cursor`), конверт ошибок `{error{code,message,details,trace_id}}`, логин `POST /api/admin/v1/auth/login` с `{email,password}` → `data.token`, и данные скоупятся проектом (`/api/admin/v1/projects/{project}/...`).

Предыдущая попытка (Vite + shim'ы `next/*` + самописный `main.tsx`) отменяется целиком: она ломала запуск и нарушала требование «ни капли от себя».

## Goals / Non-Goals

**Goals:**
- `frontends/admin` — точная копия источника, работающая на Bun/Next как исходник.
- Реальный вход оператора и попадание на `/admin` (дашборд).
- Разделы с бекенд-аналогом показывают и меняют данные платформы.
- Всё поднимается одной командой вместе со стеком, отдаётся через gateway.

**Non-Goals:**
- Любые правки разметки/стилей/состава разделов; новые экраны; переименование маршрутов.
- Правка backend-API «под фронт» и изменение общего конверта ответов платформы.
- Использование `packages/frontend/ui-kit` и `api-client` в этой панели (источник дизайна и данных — сама вёрстка).

## Decisions

1. **Полная замена содержимого `frontends/admin` копией источника.** `rm -rf frontends/admin/*` (кроме служебных файлов сборки, которых там быть не должно) + `cp -a frontends/source-admin/. frontends/admin/`, включая `next.config.ts`, `tsconfig.json`, `eslint.config.js`, `postcss.config.mjs`, `components.json`, `public/`, `bun.lock`, `package.json`. Проверка идентичности — `diff -r` по `src` и `public`. Альтернатива (Vite + shim'ы) отвергнута: сломанный запуск, нарушение требования.
2. **Bun как рантайм.** Контейнер `admin-front` — образ `oven/bun`, команда `bun install --frozen-lockfile && bun run build && bun run start` (dev-профиль: `bun run dev`). Node/npm-workspace из compose для панели уходит; корневые npm workspaces панель больше не включают.
3. **Точка расширения — только слой данных.** Компоненты и страницы не трогаем. Меняем/дописываем исключительно `src/lib/admin/data-source/*` и `src/lib/admin/mocks/auth.ts` (модуль аутентификации, который вызывает форма). Это тот слой, который вёрстка и предусмотрела для подключения бекенда, поэтому «перенос как есть» не нарушается.
4. **Адаптер контракта в `api-client.ts`.** Реализация api-client переписывается под платформу: заголовок `Authorization: Bearer <token оператора>`, базовый URL — origin панели (запросы идут через тот же gateway), путь проекта подставляется из активного проекта, ответы платформы приводятся к ожидаемым вёрсткой формам (`{success,data}`, `{items,page,size,totalItems,totalPages}` из курсорных ответов), ошибки платформы → `error{code,message}`. Никакой второй логин по username/password: токен берётся из сессии оператора.
   Альтернатива — BFF-прокси route handlers в Next (`app/api/**`), приводящий формат. Отвергнута как лишний слой: api-client и так наш код-адаптер, а прокси добавил бы второй сетевой хоп и дублирование маршрутов.
5. **Сессия и вход.** `POST /api/admin/v1/auth/login` (email/password) → токен. Хранение — как ожидает вёрстка: cookie `auth_token` (+ `auth_role`) и `localStorage.current_user` (эти ключи вёрстка уже использует в топбаре и гварде). Реализация кладётся в `src/lib/admin/mocks/auth.ts` (сигнатура `authenticateMockUser` сохраняется), поэтому `LoginForm.tsx` остаётся байт-в-байт исходным, включая редирект `router.push("/admin")` на дашборд. Профиль оператора берётся из `GET /api/admin/v1/me`.
6. **Гвард разделов — middleware Next** (`middleware.ts`), проверяющий cookie `auth_token` для `/admin/**` и редиректящий на `/login`. Выход — существующий `app/actions/auth.ts` (server action, удаляющий cookies), дополнительно чистится `current_user`.
7. **Текущий проект.** Панель работает в контексте одного проекта: `GET /api/admin/v1/bootstrap` даёт список проектов и текущий; выбранный `project.key` хранится в cookie и подставляется api-client'ом в пути `/projects/{key}/...`. Переключатель проекта в этом change не добавляется (нет в вёрстке) — берётся первый доступный/из bootstrap.
8. **Маппинг разделов на сервисы** (что подключаем):
   - `blogs` → content-service (посты: список/создание/публикация/ревизии), `categories` → content-service (категории, nested set), SEO-поля разделов → `seo/{type}/{id}`;
   - `promotions`/`campaigns`… — без аналога: остаются на mock;
   - `customers` → auth-service (пользователи проекта: список, блокировка), `team` → auth-service (участники и роли), `settings` → auth-service (проект, ключи, включение сервисов, настройки);
   - `orders`/`inventory`/`products`/`variants`/`brands`/`collections` — без прямого аналога: mock (в платформе нет каталога товаров);
   - `dashboard` → analytics-service (обзор, топ-страницы, выручка), `notifications`/`support` — mock.
   Точный перечень фиксируется в задачах; принцип: подключаем только то, для чего в платформе есть эндпоинт, остальное не выдумываем.
9. **Gateway.** Правила: `/_next/*`, `/login`, `/admin*` и корень идут на `admin-front`; API-префиксы остаются за сервисами. Порядок матчеров важен: API-правила объявляются раньше catch-all панели.
10. **CI.** Шаг сборки фронта переходит на Bun (`bun install --frozen-lockfile`, `bun run build`) в каталоге `frontends/admin`; проверка `diff -r` источника и панели по `src`/`public` — красный билд при расхождении вёрстки.

## Risks / Trade-offs

- [Правки в `data-source`/`mocks/auth` формально меняют файлы источника] → ограничиваем изменения ровно этими модулями слоя данных, компоненты и стили не трогаем; CI-diff проверяет `src/components`, `src/app`, `src/styles.css`, `src/theme.css`, `public`.
- [Контракты вёрстки и платформы расходятся сильнее, чем ожидается (поля сущностей)] → мапперы приводят поля; там, где сущности платформы принципиально беднее, раздел остаётся на mock, а не «дорисовывается» на фронте.
- [Next в контейнере на WSL-маунте медленно собирается] → в compose используется production-сборка (`bun run build && bun run start`), дев-режим — по требованию через отдельный профиль.
- [Bun-образ тянется из сети, а Docker Hub периодически отдаёт TLS-таймауты] → образ фиксируется тегом и подтягивается заранее; при недоступности сборка панели не блокирует backend-стек.
- [Cookie-сессия оператора и introspection-кэш сервисов] → выход и смена ролей отражаются с задержкой TTL кэша (60–120 c), как и в остальной платформе.

## Migration Plan

Замена содержимого каталога, backend не затрагивается. Откат — вернуть предыдущий образ панели; данные платформы не мигрируют.

## Open Questions

- Нужен ли переключатель проектов в шапке (в исходной вёрстке его нет) — решается после первого прогона на реальных данных; на структуру задач не влияет.
