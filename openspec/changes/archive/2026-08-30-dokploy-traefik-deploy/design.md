# Design: dokploy-traefik-deploy

## Context

Мотивация — в `proposal.md`. Текущее состояние: gateway — Caddy (`infra/gateway/Caddyfile`, path-матчеры с приоритетом модульных admin-путей над catch-all auth); compose (`infra/compose/compose.yaml`) рассчитан на запуск с `--project-directory` из корня (контексты `.`, пути `./infra/...`), PHP-сервисы используют общий Dockerfile, но работают через bind-mount `.:/var/www` (entrypoint доустанавливает vendor); панель — `oven/bun` c `bun install && build && start` при каждом старте; настройки — в `infra/services/<service>/.env` (копии примеров), секреты хранилищ захардкожены в compose; бутстрап (манифесты, оператор) — вручную через `tools/smoke.sh`/`tools/cms bootstrap`. Merged swagger уже собирается `./tools/cms api` в `openapi/openapi.json` (под версионным контролем, CI следит за актуальностью). Целевая площадка — Dokploy (сервис типа compose), собственный системный Traefik Dokploy занимает хостовые 80/443 и маршрутизирует домены на контейнеры.

## Goals / Non-Goals

**Goals:**

- Один и тот же compose-файл — производственный запуск в Dokploy и основа dev-стека; вся разница dev/prod — в override-файле и переменных.
- Ноль ручных шагов между `up` и работающей панелью со входом.
- Контракт `localhost:8080` для tools/smoke/e2e сохраняется — регрессия существующих проверок и есть приёмка маршрутизации.

**Non-Goals:**

- HTTPS/сертификаты внутри стека: TLS терминирует системный прокси Dokploy (или любой внешний прокси); локально — HTTP.
- CI/CD-пайплайн деплоя (автодеплой по пушу настраивается в Dokploy штатно, вне репозитория).
- Изменение кода сервисов, HTTP-контрактов и портов приложений.
- Масштабирование/репликация сервисов и внешние managed-БД.

## Decisions

### Д1. Traefik внутри стека, конфигурация file-provider

Gateway — контейнер `traefik:v3` в составе compose со статической (`infra/gateway/traefik.yml`: entrypoint `:80`, file-provider, access-логи) и динамической (`infra/gateway/dynamic.yml`: routers/services/middlewares) конфигурацией. Никаких docker-labels: вся матрица маршрутов — один читаемый файл, диф с Caddyfile очевиден, и стек самодостаточен (работает без Dokploy).
*Альтернатива* — labels на системном Traefik Dokploy: отвергнута — маршрутизация размазывается по сервисам, локальный/CI-запуск теряет gateway, «одна команда» перестаёт быть правдой вне Dokploy.

### Д2. Матрица маршрутов — регэксп-роутеры с явными приоритетами

Перенос Caddyfile 1:1: `PathRegexp` для модульных admin-путей (`^/api/admin/v1/projects/[^/]+/(content|analytics|pay)(/|$)`) с высоким приоритетом; `PathPrefix` для auth catch-all и публичных групп со средним; health-роутеры (`/health/<svc>`) с middleware `replacePath: /health`; роутер панели — `PathPrefix(/)` с минимальным приоритетом. Приоритеты задаются явно числами (в Traefik длина правила решает неочевидно — фиксируем руками). Middleware `compress` на entrypoint.

### Д3. Один базовый compose + dev-override, пути относительны файлу

`infra/compose/compose.yaml` — производственный: контексты сборки `../..`, конфиги `../gateway/...`, без bind-mount кода, без публикации портов хранилищ; работает `docker compose -f ... up -d` из любого места (relative-пути compose резолвит от файла). `infra/compose/compose.dev.yaml` — override для разработки: bind-mount `../..:/var/www` для PHP, запуск панели из исходников, публикация портов Postgres/ClickHouse при необходимости. `tools/cms` собирает `-f compose.yaml -f compose.dev.yaml` (замена `--project-directory`), Dokploy указывает только базовый файл.
*Альтернатива* — отдельный prod-compose: отвергнута, две копии матрицы сервисов разъезжаются.

### Д4. Переменные: environment-дефолты в compose, один корневой env

`env_file` per-service удаляются. Все переменные приложений — в общих YAML-якорях compose (`x-php-env`) с интерполяцией `${VAR:-default}`: подключения (postgres/redis/clickhouse/minio), межсервисные URL, `LOG_CHANNEL=stderr` и т.п. Секреты и площадко-зависимые значения читаются из корневого env-источника: локально — `infra/compose/.env` (compose подхватывает `.env` рядом с файлом автоматически), в Dokploy — переменные окружения проекта. `infra/compose/.env.example` перечисляет только производственно-обязательное: `APP_URL`, `POSTGRES_PASSWORD`, `CLICKHOUSE_PASSWORD`, `MINIO_ROOT_USER/PASSWORD`, `SERVICE_TOKEN`, `APP_KEY` четырёх сервисов, `ADMIN_EMAIL/ADMIN_PASSWORD`, опциональные интеграции (`OPENAI_API_KEY`) — с однострочниками генерации. Dev-дефолты секретов (текущие `platform`/`dev-service-token`) остаются в compose — стек стартует вообще без `.env`; обязанность переопределить в проде фиксируется в `.env.example` и docs (риск ниже). `.env.local`-механика content-service заменяется теми же корневыми переменными.

### Д5. Самодостаточные PHP-образы

Dockerfile уже копирует пакеты и ставит зависимости — build-arg `APP_SERVICE` начинает реально использоваться: в базовом compose каждый сервис собирается со своим `build.args.APP_SERVICE`, без volume; entrypoint сохраняет доустановку vendor только как dev-ветку (когда каталог примонтирован и пуст). Кэш сборки общий (одинаковые слои до `COPY apps/...`).

### Д6. Прод-образ панели

Новый `infra/docker/admin-front.Dockerfile`: multi-stage на `oven/bun` — `bun install --frozen-lockfile` → `bun run build` → runtime-стадия `next start` (standalone-вывод Next). В dev-override панель, как сейчас, запускается из исходников. `NEXT_PUBLIC_*` фиксируются на сборке (same-origin — дефолты уже пустые), `ADMIN_INTERNAL_API_BASE_URL` указывает на gateway-сервис.

### Д7. Бутстрап в entrypoint, идемпотентно

Расширение `infra/docker/entrypoint.sh` (только для API-контейнеров, не воркеров): после `AUTO_MIGRATE` — `MANIFEST_PUBLISH=1` → `php artisan manifest:publish` (+ `manifest:publish-licensing` в pay); auth-сервис дополнительно при `ADMIN_SEED=1` создаёт корневого оператора `firstOrCreate` по `ADMIN_EMAIL`/`ADMIN_PASSWORD` через выделенную artisan-команду (`operator:seed`) — без tinker-строк. Всё идемпотентно: повторный старт ничего не дублирует, существующий оператор не перезаписывается. `tools/cms bootstrap`/`smoke.sh` перестают быть обязательными для первого входа, но продолжают работать.
*Альтернатива* — one-shot bootstrap-контейнер: отвергнута — ещё одна единица оркестрации, тот же код.

### Д8. `/api/docs` — контейнер swagger-ui поверх версионируемой спеки

Сервис `docs`: официальный образ `swaggerapi/swagger-ui` с `BASE_URL=/api/docs` и `SWAGGER_JSON=/spec/openapi.json`, файл `openapi/openapi.json` монтируется read-only (в прод-варианте — копируется в лёгкий образ, чтобы не зависеть от bind-mount). Traefik-роутеры: `/api/docs` и `/api/docs/*` → docs (приоритет выше публичных `/api/*`-групп сервисов); спека по `/api/docs/openapi.json` отдаётся тем же сервисом. Актуальность обеспечивает существующий контур: `./tools/cms api` + CI-проверка свежести файла.

### Д9. Приёмка — существующими проверками

Матрица маршрутизации подтверждается прогоном `tools/smoke.sh` (он покрывает все группы путей: admin, публичные, health, вебхук-пути через подписку) и e2e `console-navigation` на новом стеке; дополнительный ручной шаг — деплой в Dokploy по инструкции. Отдельный тестовый харнесс для Traefik не строится.

## Risks / Trade-offs

- [Dev-дефолты секретов уедут в прод] → `.env.example` — единственный документированный путь деплоя, с блоком «обязательно переопределить»; `APP_ENV=production` при заданном `APP_URL` с https; чек-лист в docs/deploy.
- [Приоритеты Traefik-правил тоньше Caddy `handle`-порядка] → явные числовые priorities + полный smoke как регрессия каждой группы маршрутов.
- [Прод-образ панели: `NEXT_PUBLIC_*` фиксируются в сборке] → все значения по умолчанию same-origin/пустые; площадкам с иным API-origin понадобится пересборка — зафиксировано в docs.
- [Bind-mount vs COPY для openapi.json в Dokploy] → в базовом compose спека попадает в образ docs на сборке; монтирование — только в dev-override.
- [Сборка всех образов на сервере Dokploy тяжёлая] → общий базовый слой PHP-образов кэшируется; допустимо включить в Dokploy build-кэш; вынос в registry — вне объёма.
- [Порт 8080 занят на хосте] → `GATEWAY_PORT` остаётся переопределяемым; в Dokploy публикация хостового порта вообще не требуется (домен → контейнерный 80).

## Migration Plan

1. Ввести Traefik-конфиги и новый compose параллельно, переключить dev-стек (`tools/cms`), прогнать smoke + e2e локально.
2. Удалить Caddyfile и per-service `.env`-обвязку, обновить docs.
3. Деплой в Dokploy: сервис compose → путь файла → переменные из `.env.example` → домен на gateway; smoke по домену.
4. Rollback: revert коммита возвращает Caddy-стек; данные в именованных томах не затрагиваются.

## Open Questions

- Публиковать ли собранные образы в registry (ускорение redeploy в Dokploy) — можно решить после первого деплоя, на спеки и задачи не влияет.
