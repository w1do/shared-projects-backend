# Tasks: cms-ai-package

> Канон пакетов `packages/cms/*`: four-layer, DTO — spatie/laravel-data (суффикс DTO, папка на операцию), провайдер через laravel-package-tools, конструкторная инъекция. Ключи — только из ENV.

## 1. Каркас пакета

- [x] 1.1 Создать `packages/cms/ai` (composer.json `cms/ai`, автозагрузка `Cms\Ai\`, сервис-провайдер на laravel-package-tools, `config/cms-ai.php` с ENV-значениями и Polza как base_url по умолчанию); проверить, что пакет ставится в content-service через path-репозиторий и конфиг публикуется
- [x] 1.2 Подключить `laravel/ai` в content-service; проверить `composer install` и отсутствие конфликтов версий
- [x] 1.3 Добавить блок переменных в `.env.example` сервисов-потребителей и в `infra/services/content-service/.env` (`OPENAI_API_KEY` пустой, `OPENAI_BASE_URL`, `CMS_AI_MODEL`, `CMS_AI_TIMEOUT`); проверить, что реальный ключ нигде не закоммичен

## 2. Контракт

- [x] 2.1 Реализовать порт `Domain/Contracts/AiOperations` и DTO запросов/результатов пяти операций (`Application/DTOs/<Операция>/…DTO.php`) по формам из `design.md`; проверить Larastan level 8 на пакете
- [x] 2.2 Реализовать исключения `AiException` / `AiConfigurationException` / `AiRequestException` / `AiResponseException`; проверить тестом, что сообщение об ошибке авторизации не содержит ключ

## 3. Адаптер laravel/ai

- [x] 3.1 Реализовать `Infrastructure/LaravelAiOperations`: конфигурация провайдера из `cms-ai.php`, structured-вызовы по JSON-схеме и маппинг в DTO для всех пяти операций; биндинг порта в сервис-провайдере; проверить фейком SDK маппинг каждой операции
- [x] 3.2 Проверка конфигурации до сетевого вызова: без ключа — `AiConfigurationException` с внятным текстом; проверить тестом
- [x] 3.3 Обработка отказов: сеть/авторизация/лимиты/таймаут → `AiRequestException`, невалидная форма ответа → `AiResponseException`; таймаут из конфига; проверить тестами на фейке
- [x] 3.4 Контрактный тест `translate`: запрос строк на `en`+`ru` возвращает значения обеих локалей по каждому ключу (форма `key => [locale => value]`); проверить Pest-тестом

## 4. Качество и живой прогон

- [x] 4.1 Прогнать `./tools/cms test content-service` (включая новые тесты пакета), Pint и Larastan level 8 — зелёно
- [x] 4.2 Живой прогон против Polza с ключом из окружения (не из репозитория): `translate` двух строк на `en`/`ru` и `suggestCategories` по короткому описанию; убедиться, что structured output работает через Polza, зафиксировать рабочую модель по умолчанию в `design.md`; при отсутствии ключа у оператора — задача блокируется и запрашивается ключ
- [x] 4.3 Обновить `docs/` (краткий раздел: контракт, ENV-переменные, как потребителю подключить пакет); проверить соответствие реализации
