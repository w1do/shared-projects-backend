# Деплой платформы

Весь стек описан одним производственным compose-файлом `infra/compose/compose.yaml`:
Traefik-gateway (матрица маршрутов — `infra/gateway/`), четыре PHP-сервиса с воркерами
и планировщиком, панель управления (production-образ), Swagger UI на `/api/docs`,
Postgres, Redis, ClickHouse, MinIO. Пути в файле относительны ему самому — команда
работает из любого каталога, дополнительных скриптов и файлов не требуется.

Каждая переменная имеет dev-дефолт прямо в compose: стек стартует вообще без env-файла.
Бутстрап автоматический и идемпотентный: миграции, публикация манифестов сервисов,
корневой оператор из `ADMIN_EMAIL`/`ADMIN_PASSWORD` — после `up` панель сразу
принимает вход, ручных команд нет.

## Локальный запуск

```bash
git clone <repo> && cd <repo>
docker compose -f infra/compose/compose.yaml up -d
```

- Панель: http://localhost:8080/login (`root@example.com` / `secret-123`)
- Документация API: http://localhost:8080/api/docs
- Health: `/health/{auth|content|analytics|pay}`
- Порт меняется переменной `GATEWAY_PORT`.

Для разработки (bind-mount исходников, панель из исходников) используется пара файлов —
`./tools/cms up` (эквивалент `-f compose.yaml -f compose.dev.yaml`). Локальные секреты
(например, `OPENAI_API_KEY`) кладутся в `infra/compose/.env` — compose подхватывает его
автоматически.

## Деплой в Dokploy

1. **Сервис**: создайте в проекте Dokploy сервис типа **Compose** (провайдер — git-репозиторий).
2. **Файл**: укажите путь `infra/compose/compose.yaml` (ветка — production-ветка репозитория).
3. **Переменные окружения**: заполните по образцу `infra/compose/.env.example` — в нём
   только производственно-обязательное (домен, пароли хранилищ, `APP_KEY` четырёх
   сервисов, межсервисный токен, учётные данные оператора) с командами генерации значений.
4. **Домен**: повесьте домен на сервис `gateway`, контейнерный порт **80** (HTTPS
   терминирует системный прокси Dokploy; публиковать `GATEWAY_PORT` на хосте не нужно).
5. **Deploy**: стек соберётся и поднимется штатно; после первого деплоя вход в панель —
   учётными данными из `ADMIN_EMAIL`/`ADMIN_PASSWORD`.

### Чек-лист «переопределить в проде»

Всё из `.env.example` обязательно к переопределению — dev-дефолты небезопасны и публичны:

- [ ] `APP_ENV=production`, `APP_DEBUG=false`, `APP_URL=https://<домен>`
- [ ] `POSTGRES_PASSWORD`, `CLICKHOUSE_PASSWORD`, `MINIO_ROOT_USER`/`MINIO_ROOT_PASSWORD`
- [ ] `SERVICE_TOKEN`
- [ ] `AUTH_APP_KEY`, `CONTENT_APP_KEY`, `ANALYTICS_APP_KEY`, `PAY_APP_KEY`
- [ ] `ADMIN_EMAIL`, `ADMIN_PASSWORD`
- [ ] `ANALYTICS_IP_SALT`

Панель собирается с same-origin API (`NEXT_PUBLIC_*` фиксируются на сборке): панели и API
на одном домене ничего настраивать не нужно; площадке с отдельным API-origin потребуется
пересборка образа панели с другими build-args (`infra/docker/admin-front.Dockerfile`).

## Публикация образов в реестр

Backend-образы четырёх сервисов можно собрать и отправить в Container Registry GitLab
одной командой:

```bash
./tools/cms image:publish [тег]     # по умолчанию тег — короткий SHA коммита, latest — дополнительно
```

База реестра задаётся `CMS_REGISTRY_BASE` (окружение или `infra/compose/.env`), либо
выводится из gitlab-remote репозитория; доступ — заранее через `docker login`.
Отдельно: `image:build` (только сборка) и `image:push` (только отправка).

## Обновление и rollback

- **Обновление**: push в отслеживаемую ветку → redeploy сервиса в Dokploy (или локально
  `docker compose -f infra/compose/compose.yaml up -d --build`). Данные живут в именованных
  томах и переживают пересборку; бутстрап идемпотентен — повторный старт не создаёт
  дублей и не перезаписывает изменённые данные (включая пароль оператора).
- **Документация API** обновляется пересборкой `./tools/cms api` (файл `openapi/openapi.json`
  под версионным контролем, CI следит за свежестью) и redeploy'ем сервиса `docs`.
- **Rollback**: redeploy предыдущего коммита/тега тем же способом. Тома не затрагиваются;
  обратных миграций стек не выполняет — откат ниже несовместимой миграции требует
  восстановления БД из бэкапа.
- **Полное удаление данных** — только явное удаление томов: `docker compose -f
  infra/compose/compose.yaml down -v`.
