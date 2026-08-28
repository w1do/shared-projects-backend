# Tasks: dokploy-traefik-deploy

## 1. Traefik-gateway

- [ ] 1.1 Создать `infra/gateway/traefik.yml` (entrypoint :80, file-provider, access-логи, compress) и `infra/gateway/dynamic.yml` — полная матрица маршрутов из Caddyfile с явными приоритетами (модульные admin-регэкспы > auth catch-all > публичные группы > панель) и health-роутерами с `replacePath`; проверить `docker run traefik` валидирует конфиг без ошибок
- [ ] 1.2 Заменить сервис gateway в compose на `traefik:v3` с монтированием конфигов из `infra/gateway/`; удалить `infra/gateway/Caddyfile`; проверить на dev-стеке: `/health/*` четырёх сервисов, admin-путь pay-модуля, публичный `/api/v1/content/*`, корень отдаёт панель

## 2. Самодостаточный compose и переменные

- [ ] 2.1 Переписать `infra/compose/compose.yaml` в производственный базовый: пути относительно файла (`context: ../..`, `../gateway/...`), PHP-сервисы собираются с `build.args.APP_SERVICE` без bind-mount, environment-якоря с дефолтами `${VAR:-...}` вместо `env_file`, публикация только `GATEWAY_PORT`; проверить `docker compose -f infra/compose/compose.yaml config` из произвольного каталога
- [ ] 2.2 Создать `infra/compose/compose.dev.yaml` (bind-mount исходников PHP, панель из исходников, дефолтный порт) и перевести `tools/cms` на пару `-f`-файлов без `--project-directory`; `./tools/cms up|down|migrate|artisan|logs` работают как прежде
- [ ] 2.3 Создать `infra/compose/.env.example` с производственно-обязательными переменными (APP_URL, пароли Postgres/ClickHouse/MinIO, SERVICE_TOKEN, APP_KEY×4, ADMIN_EMAIL/PASSWORD, опциональные интеграции) и командами генерации; удалить обвязку `infra/services/*/.env` из compose-пути (файлы-примеры сервисов удалить или пометить устаревшими); dev-стек стартует вообще без `.env`
- [ ] 2.4 Прод-образ панели `infra/docker/admin-front.Dockerfile` (multi-stage bun build → next start) и использование его в базовом compose; проверить сборку образа и открытие панели через gateway без bind-mount

## 3. Бутстрап

- [ ] 3.1 Artisan-команда `operator:seed` в auth-service (идемпотентное создание корневого оператора из `ADMIN_EMAIL`/`ADMIN_PASSWORD`, `firstOrCreate` + super-admin, существующий не перезаписывается) с Pest-тестом идемпотентности
- [ ] 3.2 Расширить `infra/docker/entrypoint.sh`: `MANIFEST_PUBLISH=1` → публикация манифестов (в pay — обеих сигнатур), `ADMIN_SEED=1` (auth) → `operator:seed`; переменные включены в базовом compose только у API-контейнеров; проверить: чистые тома → `up` → вход в панель без ручных команд, повторный `up` без дублей

## 4. Документация /api/docs

- [ ] 4.1 Сервис docs (swagger-ui, `BASE_URL=/api/docs`, спека `openapi/openapi.json` копируется в образ; dev-override монтирует файл) + Traefik-роутер `/api/docs` с приоритетом выше публичных `/api/*`; проверить: `/api/docs` показывает эндпоинты всех сервисов, `/api/docs/openapi.json` — валидный JSON

## 5. Приёмка и документация

- [ ] 5.1 Полная регрессия на новом стеке: пересоздать стек, `tools/smoke.sh` зелёный (все группы маршрутов через Traefik), `./tools/cms e2e tests/console-navigation.spec.ts` зелёный
- [ ] 5.2 Проверка «одной команды» на чистом клоне: `git clone` во временный каталог → `docker compose -f infra/compose/compose.yaml up -d` без `.env` → health зелёные, вход оператором с dev-креденшелами, `/api/docs` открывается; стек и volumes удалить после проверки
- [ ] 5.3 `docs/deploy.md`: инструкция Dokploy (service → compose, путь файла, переменные из `.env.example`, домен на gateway, чек-лист «переопределить в проде»), локальный запуск, обновление и rollback; README-ссылка
- [ ] 5.4 Деплой в Dokploy на реальной площадке по инструкции и smoke по домену (шаг владельца площадки); зафиксировать найденные шероховатости в docs/deploy.md
