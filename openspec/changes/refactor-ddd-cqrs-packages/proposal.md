# Refactor CMS packages to canonical DDD/CQRS structure

## Why

Пакеты `packages/cms/*` (auth, content, analytics, pay, shared) разрослись неравномерно: часть контроллеров содержит валидацию и бизнес-логику, часть handlers/queries раздута и совмещает несколько ответственностей, встречаются отклонения от канонической four-layer структуры из CLAUDE.md. Это затрудняет поддержку и дальнейшее развитие платформы. Нужен полный рефакторинг к строгому DDD/CQRS без изменения внешнего поведения API.

## What Changes

- Приведение структуры каталогов каждого пакета `packages/cms/<module>/src/` к каноническому four-layer виду (Domain / Application / Infrastructure / Presentation) — перемещение неправильно размещённых классов.
- Разгрузка "толстых" контроллеров: только DTO → Handler → Resource; удаление `$request->validate()`, ручных массивов ответов и бизнес-логики из Presentation.
- Декомпозиция раздутых Handlers/Queries: один `handle()`, одна ответственность; извлечение вспомогательной логики в Domain-сервисы, ValueObjects, Infrastructure/Persistence.
- Нормализация DTO: только `spatie/laravel-data`, суффикс `DTO`, размещение в `Application/DTOs/<Сущность>/`.
- Вся HTTP-валидация выносится в FormRequests (`Presentation/Http/Api/V1/Requests/`); все ответы отдаются через JsonResource (`Presentation/Http/Api/V1/Resources/`) — конвейер контроллера строго Request → DTO → Handler → Resource.
- Устранение `app()`/`resolve()` в Domain/Application — конструкторная инъекция; проверка портов (Contracts) и адаптеров.
- Проверка сквозных инвариантов: `BelongsToProject`/tenant-изоляция, деньги только `Cms\Shared\Values\Money`, права `<service>.<resource>.<action>` на каждом admin-маршруте, тяжёлое — в Jobs.
- Все изменения — чистый рефакторинг: публичные HTTP-контракты (маршруты, форматы запросов/ответов) не меняются; Pint/Larastan/Pest остаются зелёными.

## Capabilities

### New Capabilities

Нет — поведение системы не меняется.

### Modified Capabilities

Нет — чистый рефакторинг, спек-уровневые требования не затрагиваются (`skip_specs: true`).

## Impact

- Код: `packages/cms/{auth,content,analytics,pay,shared}/src/**` — перемещение и декомпозиция классов, обновление namespace/импортов; регистрация в сервис-провайдерах пакетов.
- Тесты: `packages/cms/*/tests/**` — обновление импортов, добавление тестов на извлечённые Handlers/DTO при необходимости.
- API: без изменений (совместимость подтверждается существующими Pest-тестами и swagger-сборкой `./tools/cms api`).
- Сервисы `apps/*` затрагиваются только через обновлённые namespace, если таковые изменятся.
