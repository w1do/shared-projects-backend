# Shared Projects Backend

Единый multi-tenant backend для управления множеством проектов (сайтов) из одной панели.
Четыре Laravel-сервиса за одним gateway, вся бизнес-логика — в composer-пакетах
`packages/cms/*` (строгий DDD/CQRS), панель управления — Next.js поверх готовой вёрстки.

**Разработчик:** [@W1DO_DIGITAL](https://t.me/W1DO_DIGITAL) (Telegram)

## Быстрый старт — одна команда

Требуется только Docker (+ Compose v2):

```bash
git clone git@github.com:w1do/shared-projects-backend.git
cd shared-projects-backend
./tools/cms bootstrap
```

Команда сама: создаст `.env` каждого сервиса из примеров → соберёт и поднимет стек
(gateway, 4 сервиса, воркер очередей, postgres, redis, clickhouse, minio, панель) →
дождётся health-чеков → накатит миграции → заведёт оператора, проект `demo`,
манифесты сервисов и демо-контент (дерево категорий, посты).

После разворота:

| | |
| --- | --- |
| Панель управления | http://localhost:8080/login |
| Логин / пароль | `root@example.com` / `secret-123` |
| API | http://localhost:8080/api/… (swagger: `openapi/openapi.json`) |
| Health | `/health/{auth\|content\|analytics\|pay}` |

Для AI-функций (автоперевод, генерация) положите ключ в неотслеживаемый файл:

```bash
echo "OPENAI_API_KEY=<ключ>" > infra/services/content-service/.env.local
docker compose -f infra/compose/compose.yaml --project-directory . up -d content-service content-worker
```

## Сервисы

| Сервис | Что делает |
|---|---|
| **auth-service** | операторы, пользователи сайтов, роли/права (spatie, teams-режим), проекты и их локали, API-ключи, включение сервисов, настройки, аудит, `/bootstrap`, introspection, версия переводов |
| **content-service** | посты (статусы, ревизии, привязка к категориям), категории (nested set, перемещение поддеревьев с позицией), словарь переводов, переводимые поля, SEO + JSON-LD, sitemap, медиа (S3/MinIO) |
| **analytics-service** | `/collect` → Redis-буфер → ClickHouse, история пользователя, отчёты |
| **pay-service** | тарифы/подписки (cancel/resume/pause), платежи, идемпотентные вебхуки |
| **content-worker** | воркер очередей: автоперевод, sitemap, фоновые задачи |

## Пакеты платформы (`packages/cms/*`)

- **shared / contracts** — tenant-контекст (`project_id` везде), introspection, HTTP-envelope, деньги только в минорных единицах
- **auth, content, analytics, pay** — доменные модули (four-layer: Domain / Application / Infrastructure / Presentation)
- **ai** — единый AI-контракт `AiOperations`: `rewrite`, `normalize`, `translate`, `suggestCategories`, `generatePost`. Под капотом `laravel/ai`; провайдер по умолчанию — [Polza](https://polza.ai) (OpenAI-совместимый), меняется через `OPENAI_BASE_URL`/`OPENAI_API_KEY`/`CMS_AI_MODEL` без правки кода. Только структурные ответы: невалидный ответ модели — ошибка, а не данные
- **localization** — словарь переводов проекта `key → {locale: value}`, переводимые поля сущностей (spatie/laravel-translatable, имя категории при едином slug), автоперевод недостающих локалей через `cms/ai` с пометкой `machine` до ручного подтверждения, `translations_version` в bootstrap

## Панель управления (`frontends/admin`)

Вёрстка переносится из `frontends/source-admin` как источник правды дизайна (CI сверяет
байт-в-байт); платформа подключена только через слой данных.

- **Меню собирается из bootstrap**: раздел виден, только если его сервис включён для
  проекта и у оператора есть право; прямой заход в скрытый раздел → отказ
- **Категории** — дерево с drag-and-drop: бросок на строку вкладывает, между строками —
  задаёт порядок (сохраняется платформой); свои потомки как цель запрещены; сворачивание
  ветвей; селект категорий с вложенным деревом и поиском
- **Блоги** — статусы по статус-машине (draft/published/archived), привязка к категориям,
  ревизии с восстановлением
- **Customers / Team** — реальные пользователи и участники проекта: блокировка, удаление,
  приглашение с автосозданием оператора
- **Settings → Languages** — локали проекта, редактор словаря переводов (бейдж `machine`
  у автопереводов), кнопка «Translate missing»; имя категории вводится по локалям

Подробно: [`docs/admin-console.md`](docs/admin-console.md).

## Тесты и качество

```bash
./tools/cms test [service]   # Pest: 190+ тестов (в т.ч. пакеты) на in-memory sqlite
./tools/cms e2e [--headed]   # 21 сценарий Playwright против живого стека (headed — видно на экране)
./tools/cms api              # пересборка единого swagger (CI следит за свежестью)
```

Качество в каждом сервисе: Pint (кодстайл Spatie), Larastan level 8, Pest.
CI (`.github/workflows/pull-request.yml`): тесты 4 сервисов → swagger-контракт →
сборка фронтов → сверка вёрстки панели с источником → e2e → docker-образ.

## Прочие команды

```bash
./tools/cms up|down|restart [service]    # управление стеком
./tools/cms migrate [service]            # миграции
./tools/cms seed-demo [project]          # демо-контент в проект
./tools/cms artisan <service> <args…>    # artisan внутри контейнера
./tools/smoke.sh                         # сквозной прогон всех сервисов через gateway
```

## Архитектура и планирование

- Правила кодовой базы — [`CLAUDE.md`](CLAUDE.md), структура — [`STRUCTURE.md`](STRUCTURE.md)
- Спецификации возможностей — `openspec/specs/` (11 способностей), история изменений —
  `openspec/changes/archive/`
- Скиллы и конвенции — `.ai/skills/`

---

Вопросы и заказ разработки: Telegram [@W1DO_DIGITAL](https://t.me/W1DO_DIGITAL)
