# Refactor CMS packages to canonical DDD/CQRS structure

## Why

Пакеты `packages/cms/*` разрослись неравномерно и разъехались между собой: сейчас это шесть модуль-пакетов (auth, content, pay, analytics, localization, ai) и три библиотеки (shared, contracts, generators), и каждый пакет решает одни и те же задачи по-своему. Канонический конвейер реализован ровно в одном пакете из шести: FormRequest и JsonResource есть только в `localization`, в остальных валидация лежит в `rules()` 26 DTO, в 4 `$request->validate()`, в `Validator::make` и в `ValidationException` внутри handlers; ответы собираются 13+ ручными массивами. Policies нет ни в одном пакете, сервис-провайдер лежит в корне `src/` у семи пакетов из восьми, суффикс `*Query` соблюдён у 5 классов из 23, а `localization` напрямую импортирует модели `content` и меняет его таблицу миграцией. Это затрудняет поддержку и дальнейшее развитие платформы. Нужен полный рефакторинг всех пакетов к одному виду — строгому DDD/CQRS — без изменения внешнего поведения API.

## What Changes

- Приведение структуры каталогов всех шести модуль-пакетов `packages/cms/<module>/src/` к каноническому four-layer виду (Domain / Application / Infrastructure / Presentation) — перемещение неправильно размещённых классов, включая перенос сервис-провайдеров в `Infrastructure/Providers/`.
- Разгрузка "толстых" контроллеров: только DTO → Handler → Resource; удаление `$request->validate()`, ручных массивов ответов и бизнес-логики из Presentation.
- Декомпозиция раздутых Handlers/Queries: один `handle()`, одна ответственность; извлечение вспомогательной логики в Domain-сервисы, ValueObjects, Infrastructure/Persistence.
- Нормализация DTO: только `spatie/laravel-data`, суффикс `DTO`, размещение в `Application/DTOs/<Сущность>/`.
- Вся HTTP-валидация выносится в FormRequests (`Presentation/Http/Api/V1/Requests/`); все ответы отдаются через JsonResource (`Presentation/Http/Api/V1/Resources/`) — конвейер контроллера строго Request → DTO → Handler → Resource.
- Устранение `app()`/`resolve()` в Domain/Application — конструкторная инъекция; проверка портов (Contracts) и адаптеров.
- Введение Policies для per-record авторизации (сейчас таких проверок нет ни в одном пакете — они инлайнятся в контроллерах и handlers), с сохранением текущих кодов ответов.
- Закрытие нарушенных границ пакетов: `localization` перестаёт напрямую работать с моделями и таблицами `content` — взаимодействие через порт с адаптером на стороне `content`.
- Проверка сквозных инвариантов: `BelongsToProject`/tenant-изоляция (включая единственную бизнес-таблицу без `project_id` — `payment_webhook_events`), деньги только `Cms\Shared\Values\Money`, права `<service>.<resource>.<action>` на каждом admin-маршруте, тяжёлое и внешнее — в Jobs.
- Машинное закрепление канона: обновлённые стабы `MakeModuleCommand`, архитектурный тест-гейт по всем модуль-пакетам и приведение `CLAUDE.md`/`STRUCTURE.md` к реализованному канону (сейчас `CLAUDE.md` предписывает `rules()` в DTO, что противоречит принятому конвейеру).
- Согласованное отступление от Safety Protocol И12 (задача 6.3): префикс ключа bootstrap-кэша НЕ менялся, потому что форма кэшируемого значения доказанно не изменилась — guard-тест 0.13 выполняет round-trip старого значения через новый Resource с `assertExactJson`, а ключ фиксирует литеральной регуляркой; сценарий «новый код читает старую структуру» исключён по построению.
- Все изменения — чистый рефакторинг: публичные HTTP-контракты (маршруты, форматы запросов/ответов) не меняются; Pint/Larastan/Pest остаются зелёными. Найденные поведенческие дефекты фиксируются отдельным списком, а не чинятся молча внутри рефакторинга.

## Capabilities

### New Capabilities

Нет — поведение системы не меняется.

### Modified Capabilities

Нет — чистый рефакторинг, спек-уровневые требования не затрагиваются (`skip_specs: true`).

## Impact

- Код: `packages/cms/{auth,content,pay,analytics,localization,ai}/src/**` — перемещение и декомпозиция классов, обновление namespace/импортов; точечно `packages/cms/{shared,contracts,generators}` — общие примитивы конвейера, стабы генератора.
- Тесты: `packages/cms/*/tests/**` — снапшот-тесты JSON-ответов (успех + 422 + 404) пишутся первыми, до любого переноса валидации; обновление импортов; тесты категорий переезжают из `localization/tests` в `content/tests`.
- БД: две вынужденные структурные миграции — `payment_webhook_events.project_id` и переезд миграции `categories` из `localization` в `content`; обе обратимые, поведение эндпоинтов не меняется.
- API: без изменений (совместимость подтверждается снапшот-тестами, существующими Pest-тестами и swagger-сборкой `./tools/cms api`).
- Документация: `CLAUDE.md`, `STRUCTURE.md` — приведение к реализованному канону.
- Сервисы `apps/*` затрагиваются через обновлённые namespace в `extra.laravel.providers` и autoload, а `auth-service` — через перенос маппинга исключения в exception handler.
