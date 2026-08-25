# Design: cms-ai-package

## Context

См. `proposal.md`; требования — `specs/ai-operations/spec.md`.

Проверено при планировании:

- `laravel/ai` v0.11.0 — официальный SDK (`php ^8.3`, `illuminate ^12|^13`); сервисы платформы на Laravel `^13.17`, PHP 8.4/8.5 — совместимо. SDK даёт единый API над провайдерами, structured output по JSON-схеме и фейки для тестов.
- Polza — OpenAI-совместимый API (`https://polza.ai/api/v1`), т.е. подключается как OpenAI-провайдер с переопределённым базовым адресом. Скилл `.ai/skills/polza-ai` покрывает transcription/embeddings — они здесь сознательно не используются (нет потребителя).
- Канон пакетов `packages/cms/*`: four-layer, порт в `Domain/Contracts`, DTO — spatie/laravel-data с суффиксом `DTO` в папке на сущность, провайдер пакета через `laravel-package-tools`, конструкторная инъекция.
- Память проекта: конвейер HTTP (FormRequest → DTO → Handler → Resource) этого пакета не касается — HTTP-слоя здесь нет вовсе.

## Goals / Non-Goals

**Goals:**

- Один порт, за которым можно сменить и провайдера, и SDK, не трогая потребителей.
- Структурная строгость на границе: невалидный ответ модели — ошибка, а не данные.
- Нулевая сеть в тестах.

**Non-Goals:**

- Свой HTTP-клиент к Polza: `laravel/ai` уже абстрагирует провайдера, второй слой абстракции поверх собственного клиента — лишний.
- Embeddings, транскрипция, стриминг, учёт токенов — до появления потребителя.
- Кэширование ответов и rate limiting внутри пакета: это политика потребителя (Jobs, очереди), а не транспорта.

## Decisions

### 1. Порт — один интерфейс с пятью операциями, DTO на вход и выход

`Cms\Ai\Domain\Contracts\AiOperations`:

```php
interface AiOperations
{
    public function rewrite(RewriteRequestDTO $request): RewriteResultDTO;
    public function normalize(NormalizeRequestDTO $request): NormalizeResultDTO;
    public function translate(TranslateRequestDTO $request): TranslateResultDTO;
    public function suggestCategories(SuggestCategoriesRequestDTO $request): CategoryTreeDTO;
    public function generatePost(GeneratePostRequestDTO $request): PostDraftDTO;
}
```

Ключевые формы (`Application/DTOs/<Операция>/`):

- `TranslateRequestDTO { array $texts /* key => source text */, array $targetLocales, ?string $sourceLocale, ?string $context }` → `TranslateResultDTO { array $translations /* key => [locale => value] */ }` — форма «`title = [en => ..., ru => ...]`» из постановки получается напрямую.
- `SuggestCategoriesRequestDTO { string $projectDescription, ?int $maxCount, array $locales }` → `CategoryTreeDTO { list<CategorySuggestionDTO { name, slug, children }> }` — дерево, готовое к загрузке в nested set контента.
- `GeneratePostRequestDTO { string $topic, ?string $instructions, string $locale }` → `PostDraftDTO { title, slug, body }` — поля соответствуют `UpsertPostDTO` контента.
- `RewriteRequestDTO { string $text, string $instruction }` / `NormalizeRequestDTO { string $text, ?string $profile }` → `{ string $text }`.

Альтернатива — интерфейс на операцию — отвергнута: потребители почти всегда хотят «AI-возможности» целиком, пять биндингов вместо одного не дают гибкости, которой кто-то просил.

### 2. Реализация — адаптер над `laravel/ai`, structured output по схеме

`Infrastructure/LaravelAiOperations` — единственное место, знающее про SDK. Каждая операция: системный промпт (константа пакета) + JSON-схема результата → structured-вызов SDK → маппинг в DTO. Ответ, не прошедший схему или маппинг, — `AiResponseException`.

Альтернатива — просить модель «ответь JSON-ом» и парсить руками — отвергнута: SDK умеет схемы нативно (`illuminate/json-schema`), ручной парсинг — источник тихого мусора.

### 3. Конфигурация: OpenAI-совместимый провайдер, все значения из ENV

`config/cms-ai.php`:

```php
return [
    'provider' => env('CMS_AI_PROVIDER', 'openai'),
    'api_key' => env('OPENAI_API_KEY'),
    'base_url' => env('OPENAI_BASE_URL', 'https://polza.ai/api/v1'),
    'model' => env('CMS_AI_MODEL', 'gpt-4o-mini'),
    'timeout' => (int) env('CMS_AI_TIMEOUT', 30),
];
```

Пакет конфигурирует провайдера SDK из этих значений в своём сервис-провайдере. Polza — только строка по умолчанию: перенос на любой OpenAI-совместимый сервис = два значения в `.env`. Отсутствие ключа проверяется до сетевого вызова — `AiConfigurationException` с внятным текстом.

### 4. Ошибки: два исключения пакета

`AiConfigurationException` (нет ключа, кривой конфиг) и `AiRequestException` (сеть, авторизация, лимиты, таймаут; `AiResponseException extends AiRequestException` — невалидная форма ответа). Сообщения не содержат ключа. Потребители ловят базовый `AiException`.

### 5. Тесты — фейк SDK, контрактные проверки

Pest-тесты пакета гоняются в сервисах (как остальные `cms/*`, suite `Packages` в content-service — первом потребителе): фейковый провайдер SDK возвращает заготовленные структуры; проверяются маппинг в DTO всех пяти операций, ошибка на невалидной форме, ошибка конфигурации без ключа. Сети нет.

### 6. Регистрация пакета

`composer.json` пакета (`cms/ai`), path-репозиторий в сервисах-потребителях, сервис-провайдер через `laravel-package-tools`: publish конфига, биндинг `AiOperations → LaravelAiOperations`. В это изменение пакет подключается в **content-service** (первый потребитель — localization живёт в контенте); остальные сервисы подключат его своими изменениями.

## Risks / Trade-offs

- [`laravel/ai` — v0.x, API может меняться] → SDK изолирован в одном инфраструктурном классе; порт и DTO — наши, обновление SDK не трогает потребителей.
- [Модель по умолчанию может не поддерживаться Polza] → модель — ENV-значение; выбор дефолта проверяется в задаче живого прогона и корректируется без правки кода.
- [Structured output у OpenAI-совместимых прокси бывает урезан] → в задаче живого прогона проверяется именно структурный вызов через Polza; если схема не поддерживается — fallback внутри адаптера: обычный вызов + строгая валидация JSON, контракт не меняется.
- [Промпты в коде разрастутся] → промпты — константы адаптера при пяти операциях; вынос в конфиг/БД — только когда появится реальная нужда их менять без деплоя.

## Migration Plan

Аддитивно: новый пакет и новые ENV-переменные, существующий код не меняется. Откат — удалить пакет из composer сервисов. Живой прогон против Polza — отдельная задача с реальным ключом из окружения (в репозиторий ключ не попадает).

## Open Questions

нет. Живой прогон через Polza выполнен: structured output работает (перевод вернул `key => {en, ru}` точно по схеме, категории — валидное дерево из плоского `parent_slug`-списка). Рабочая модель по умолчанию — `openai/gpt-5.4-mini` (каталог Polza не содержит `openai/gpt-4o-mini`; актуальный список — `GET /v1/models`).
