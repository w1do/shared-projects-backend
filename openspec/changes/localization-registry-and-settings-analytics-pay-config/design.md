## Context

Система состоит из 4 Laravel-сервисов за gateway, бизнес-логика в `packages/cms/*` с DDD/CQRS и четырёхслойной структурой (см. CLAUDE.md). Локализации разбросаны по коду/вёрстке; отсутствует единый источник правды и механизм синхронизации. Требуется кросс‑сервисный пакет локализаций и централизованные настройки (spatie/laravel-settings).

## Goals / Non-Goals

**Goals:**
- Пакет `cms/localization` с единым реестром (регистрация из сервисов) и таблицей `localization`.
- Команда `localize:sync` для выравнивания БД и источников регистрации.
- Перенос ключей сервисов в `Domain/Enums` и регистрация через провайдеры.
- Настройки проекта (язык, валюты), аналитики (IDs), платежей (выбор Platega) через spatie/laravel-settings.

**Non-Goals:**
- UI‑реализация админки вне backend API.
- Изменение доменной логики платежей/контента, кроме конфигурирования провайдера.

## Decisions

_(уточнено при реализации: пакет `cms/localization` уже существует; БД — на сервис, поэтому кросс-сервисная регистрация решается через `cms/contracts`; решения подтверждены владельцем изменения)_

1) Расширяем существующий пакет `packages/cms/localization` (four‑layer, живёт в content-service)
- Domain: `Models/Localization` (таблица `localization`, `BelongsToProject`), `Contracts/LocalizePort` (регистрация), `Contracts/LocalizationReader` (чтение с fallback).
- Application: `Commands/SyncLocalizationsCommand` + `Handlers/SyncLocalizationsHandler`, `Queries/ListLocalizationsQuery`, DTOs.
- Infrastructure: реализация реестра, миграция, artisan-команда `localize:sync` в `src/Console/` (как у других пакетов).
- Presentation: admin-эндпоинт чтения списка локализаций (права переиспользуют `content.translations.*`).

2) Ключи сервисов — enum-классы в `cms/contracts`
- У каждого сервиса своя БД, и `cms/pay`/`cms/analytics` не установлены в content-service, поэтому регистрация «в boot() провайдера каждого пакета» физически не собрала бы ключи в одном реестре.
- Решение: enum-ы ключей content/pay/analytics живут в `cms/contracts` (`Cms\Contracts\Localization\*`, установлен во всех приложениях); `LocalizationServiceProvider` регистрирует их по списку из конфига `cms-localization.registries`. Один `localize:sync` в content-service видит ключи всех сервисов.

3) Команда `php artisan localize:sync`
- Handler читает реестр, синхронизирует с БД: вставка недостающих, обновление изменённых `default_value`, отчёт added/updated/unchanged.
- Идемпотентность: ключ (project_id, service, key, locale). `value` — админ-переопределение (не трогается sync), `default_value` — из кода.
- Проекты: `--project=*`; без опции — все project_id, известные content-service (из таблиц `translations` ∪ `localization`).
- Чтение в рантайме: `value` → `default_value` строки → default из in-memory реестра.

4) Spatie Settings — tenant-scoped, по сервису-владельцу
- `spatie/laravel-settings`; общий tenant-scoped репозиторий в `cms/shared` (`Cms\Shared\Settings\*`): таблица `settings` с `project_id` (unique project_id+group+name), контекст из `ProjectContext`.
- Классы настроек в `Domain/Settings/` сервиса-владельца: `SiteSettings` (auth: language, currency_default, currencies[RUB,USD]), `AnalyticsSettings` (analytics: yandex_enabled, yandex_id, google_enabled, google_id), `PaymentsSettings` (pay: provider='platega').
- Admin-эндпоинты GET/PUT — в пакете владельца (конвейер FormRequest → DTO → Handler → Resource), новые права `<service>.settings.view|manage` в манифестах.
- Существующий manifest-стор `ProjectSetting` (auth) не трогаем; он остаётся для manifest-driven ключей.

5) Payments: Platega only
- `PaymentsSettings.provider` — выбор провайдера (по умолчанию `platega`; допускаются шлюзы из `ProviderRegistry`), pay-service читает его через настройки/admin-API. Фактическое переключение шлюза в `CreatePaymentHandler` выполнит интеграция Platega (отдельное изменение) — доменная логика платежей в этом изменении не меняется (Non-Goal).
- Полей доставки/налогов в backend нет и не появится; мок-вкладки Shipping и Taxes удаляются из консоли (парная правка `frontends/admin` + `frontends/source-admin`).

6) Аналитика: путь инъекции
- Публичного сайта в репозитории нет; «инъекция» = публичный read-эндпоинт analytics-service (GET config с флагами и ID счётчиков) для внешнего сайта + значения в admin-API. UI-вкладка «Аналитика» в консоли — вне скоупа (Non-Goal).

7) Nightly
- Расписание `localize:sync` регистрируется в `LocalizationServiceProvider`; в `infra/services/content-service/supervisor/` добавляется runner `schedule:work` (по образцу analytics-flush.conf), иначе расписания не исполняются.

Альтернативы: хранить локализации только в JSON‑файлах — отклонено (нет единой БД/админ‑редактирования). Использовать Laravel Lang — не покрывает регистрацию из модулей и мульти‑tenant ключи.

## Risks / Trade-offs

- Рост количества ключей и конфликтов имен → Нейминг через namespace сервиса и enum‑ключи; валидация дубликатов при sync.
- Производительность sync на больших проектах → Пакетная вставка/обновление, индекс по (project_id, service, key, locale).
- Рассинхрон верстки и БД → Команда sync + отчёт о пропущенных ключах, nightly job.

## Migration Plan
- Миграции: создать таблицу `localization`, таблицы Settings.
- Постепенный перенос ключей в Enums сервисов; временно поддерживать fallback к старым строкам, затем удалить.
- Выпустить `localize:sync`, затем включить использование значений из БД.

## Open Questions
- Нужны ли runtime‑эндпоинты для админ‑редактирования локализаций сейчас или только sync из кода? (по умолчанию — только sync + чтение).
