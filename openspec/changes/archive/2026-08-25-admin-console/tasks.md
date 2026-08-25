# Tasks: admin-console

## 1. Чистый перенос вёрстки

- [x] 1.1 Полностью очистить `frontends/admin` (удалить Vite-конфиг, shim'ы `next/*`, самописный `main.tsx`, `src/lib/platform`, `dist`, `node_modules`); проверить, что каталог пуст
- [x] 1.2 Скопировать `frontends/source-admin/.` в `frontends/admin/` целиком (src, public, next.config.ts, tsconfig.json, eslint/prettier/postcss/components.json, package.json, bun.lock); проверить `diff -r frontends/source-admin/src frontends/admin/src` и `diff -r .../public` — расхождений нет
- [x] 1.3 Исключить панель из корневых npm workspaces (панель живёт на Bun самостоятельно); проверить `npm run build --workspaces` в корне не трогает `frontends/admin`

## 2. Запуск на Bun

- [x] 2.1 `bun install --frozen-lockfile` и `bun run build` в `frontends/admin` на хосте; проверить успешную production-сборку исходной вёрстки без правок
- [x] 2.2 Перевести сервис `admin-front` в compose на образ `oven/bun` (фиксированный тег), команда `bun install --frozen-lockfile && bun run build && bun run start`, порт 3000; проверить `docker compose up -d admin-front` и ответ контейнера
- [x] 2.3 Обновить `infra/gateway/Caddyfile`: `/_next/*`, `/login`, `/admin*` и `/` → admin-front, API-матчеры остаются выше; проверить curl-ом: `/` редиректит на `/admin`, статика `_next` отдаётся 200
- [x] 2.4 Завести `infra/services/admin-front/.env` с `NEXT_PUBLIC_ADMIN_*` (data source, base url) и подключить его в compose; проверить, что переменные видны в контейнере
- [x] 2.5 Проверить весь стек одной командой: `./tools/cms up` поднимает панель и API, панель открывается через gateway без ошибок в консоли браузера (headless-проверка страницы `/login`)

## 3. Вход оператора и защита разделов

- [x] 3.1 Реализовать аутентификацию против auth-service в `src/lib/admin/mocks/auth.ts` (сохранив сигнатуру, вызываемую `LoginForm`): `POST /api/admin/v1/auth/login` (email/password) → токен, профиль из `GET /api/admin/v1/me`; `LoginForm.tsx` не изменяется — проверить `diff` этого файла с источником
- [x] 3.2 Сохранение сессии в ожидаемом вёрсткой виде: cookie `auth_token`/`auth_role` и `localStorage.current_user`; проверить, что после входа происходит редирект на `/admin` и дашборд рендерится
- [x] 3.3 Ошибка входа: неверный пароль показывает toast с сообщением, оператор остаётся на `/login`; проверить сценарий
- [x] 3.4 `middleware.ts`: `/admin/**` без cookie `auth_token` → редирект на `/login`; проверить открытие раздела в приватном окне
- [x] 3.5 Выход через существующий `app/actions/auth.ts`: чистит cookies и `current_user`, уводит на `/login`; проверить, что после выхода разделы недоступны

## 4. Адаптер API платформы в слое данных

- [x] 4.1 Переписать `src/lib/admin/data-source/api-client.ts` под контракт платформы: Bearer-токен оператора из сессии, базовый URL — origin панели, конверт `{data}`/`{error}` платформы → ожидаемый вёрсткой `{success,data,error}`, курсорные ответы → `{items,page,size,totalItems,totalPages}`; юнит-проверка адаптера на фикстурах ответов платформы
- [x] 4.2 Текущий проект: получить `GET /api/admin/v1/bootstrap`, сохранить `project.key` в cookie, подставлять в пути `/api/admin/v1/projects/{key}/...`; проверить, что запросы уходят со скоупом проекта
- [x] 4.3 Обработка ошибок: 401 → выход на `/login`, 403 и 422 → toast с сообщением из конверта ошибки, сетевые ошибки → toast; проверить, что интерфейс не виснет и не белеет
- [x] 4.4 Включить режим реальных данных (`NEXT_PUBLIC_ADMIN_DATA_SOURCE=api`) и убедиться, что разделы без подключения продолжают работать на mock без ошибок

## 5. Подключение разделов к сервисам платформы

- [x] 5.1 `dashboard` → analytics-service: обзор/топ-страницы/выручка за период через `projects/{p}/analytics/*`; проверить, что графики показывают данные платформы
- [x] 5.2 `blogs` → content-service: список постов, создание, публикация, ревизии; проверить сохранение и отображение после перезагрузки
- [x] 5.3 `categories` → content-service: дерево категорий, создание, перемещение узла; проверить отображение вложенности
- [x] 5.4 SEO-поля в разделах контента → `content/seo/{type}/{id}` (включая JSON-LD); проверить сохранение и чтение
- [x] 5.5 `customers` → auth-service: пользователи проекта, блокировка/разблокировка; проверить операции
- [x] 5.6 `team` → auth-service: участники проекта и их роли; проверить назначение роли
- [x] 5.7 `settings` → auth-service: данные проекта, API-ключи (выдача/отзыв), включение сервисов, настройки сервисов; проверить операции
- [x] 5.8 Зафиксировать в `docs`/README перечень разделов, оставшихся на mock (нет аналога в платформе), чтобы это не выглядело недоделкой

## 6. Проверка и CI

- [x] 6.1 Сквозной сценарий через gateway: вход → дашборд с данными → создание поста в blogs → он виден в публичном API content-service; проверить headless-прогоном
- [x] 6.2 CI: сборка панели на Bun (`bun install --frozen-lockfile`, `bun run build`) вместо npm-workspace-сборки; красный шаг блокирует мёрж
- [x] 6.3 CI-проверка неизменности вёрстки: `diff -r` источника и панели по `src/components`, `src/app`, `src/styles.css`, `src/theme.css`, `public` — расхождение валит билд
- [x] 6.4 Обновить README: запуск панели на Bun, вход оператором, какие разделы живые, а какие на демо-данных
