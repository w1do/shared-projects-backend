# Tasks — refactor-ddd-cqrs-packages

Гейт каждого этапа: `composer lint && composer stan && composer test` соответствующего пакета/сервиса зелёные; публичные HTTP-контракты не изменились.

Конвейер каждого контроллера после рефакторинга: FormRequest (`Presentation/Http/Api/V1/Requests/`) → DTO → Handler → JsonResource (`Presentation/Http/Api/V1/Resources/`). Перед переносом валидации/ответов пакета — снапшот-тесты текущих JSON-ответов (успех + ошибки 422).

## 1. Analytics

- [ ] 1.1 Создать DTO для отчётов (`Application/DTOs/Report/{OverviewDTO,RevenueDTO,TopPagesDTO,UserHistoryDTO}` или по фактическим сущностям) и перевести 4 query-класса с возврата `array` на DTO; ответы отдавать через JsonResource в `Resources/Report/`; проверить Pest-тестами отчётных эндпоинтов, что JSON-ответы байт-в-байт совпадают.
- [ ] 1.2 `Admin/ReportsController`: убрать `$request->validate()` (строка ~65) и вычисление дат — ввести `ReportPeriodRequest` (FormRequest) + `ReportPeriodDTO`; дисп. `ExportReportJob` перенести в `ExportReportHandler`; проверить тестами экспорт и валидационные ошибки (те же статусы/сообщения).
- [ ] 1.3 `Site/CollectController`: rate-limit и bot-filter вынести в middleware, payload-валидацию — в `CollectEventsRequest` (FormRequest) + `CollectEventsDTO`; проверить тестом лимитов (429) и отбрасывания ботов.
- [ ] 1.4 `Internal/EventsController`: повесить `ServiceToken` middleware на `routes/internal.php`, убрать `hash_equals` из контроллера; агрегацию `$accepted` перенести в `RecordEventsHandler` (batch-обработка одним вызовом); ответ через JsonResource; проверить internal-тестами.
- [ ] 1.5 Завести минимальный `Domain/` (Enums типов событий, Contracts ClickHouse-порта по факту использования), удалить пустую `src/Application/Data/`; прогнать полный гейт analytics.

## 2. Content

- [ ] 2.1 Создать `UpsertPageCommand` + `UpsertPageHandler` (слаг-генерация, Optional-merge из приватного `fill()`), `ListPagesQuery`; `PageController` сделать тонким; проверить Pest-тестами CRUD страниц.
- [ ] 2.2 `MediaController`: убрать `$request->validate()`, ввести `UploadMediaRequest` (FormRequest), `MediaDTO` и `MediaResource` вместо ручного `serialize()`; `index()` — в `ListMediaQuery`; проверить тестами медиа-эндпоинтов.
- [ ] 2.3 `SeoController`: карту type→class перенести в enum `Domain/Enums/SeoableType` с методом резолва; проверить тестами SEO-эндпоинтов.
- [ ] 2.4 Устранить дублированные `Model::query()->find()` + `ErrorEnvelope::notFound()` в `PostController`/`CategoryController`/`PageController` (общий приём: query-объект или findOrFail-хелпер в shared); `actorId()`-plumbing вынести в общий helper (см. 5.2); проверить: 404-поведение не изменилось.
- [ ] 2.5 `Site/PublicContentController`: кэш-оркестрацию (md5-ключ, `ContentCache::remember`, round-trip через `getData(true)`) перенести в кэширующий query-объект; проверить тестами публичного контента и попадания в кэш.
- [ ] 2.6 Перенести `rules()` всех DTO пакета content в FormRequests (`Requests/<Сущность>/`) и все ответы контроллеров на JsonResource (`Resources/<Сущность>/`); снапшот-тесты подтверждают неизменность JSON (успех и 422).
- [ ] 2.7 Переименовать query-классы content на суффикс `*Query`, прогнать полный гейт content.

## 3. Auth

- [ ] 3.1 Извлечь `AdminPermissionResolver` (дублированный team-id-swap) и использовать его в `IntrospectSubject` и `BuildBootstrap`; проверить существующими introspection/bootstrap-тестами.
- [ ] 3.2 Разрезать `IntrospectSubject` (115 строк, 2 публичных метода) на `IntrospectTokenQuery` и `IntrospectApiKeyQuery`; мутацию `last_used_at` вынести в Job/handler; проверить тестами интроспекции и что `last_used_at` продолжает обновляться.
- [ ] 3.3 Декомпозировать `BuildBootstrap` (103 строки): извлечь `NavigationFilter`, ввести `BootstrapDTO`/`ServiceNavigationDTO` вместо 5-ключевого массива и `BootstrapResource` для ответа; проверить bootstrap-тестом на идентичный JSON.
- [ ] 3.4 `PutSettingsHandler`: убрать `Validator::make()` — извлечь `SettingsSchemaValidator` и `SettingWriter`; проверить тестами настроек, включая secret-поля и audit-записи.
- [ ] 3.5 `SiteAuthController`: `currentUser()` (blocked-check + project-scope) → middleware/Policy; `logout()` → handler; handlers возвращают `AuthTokenDTO` (заменить `array{token,user}`), ответ — через `AuthTokenResource`; проверить site-auth тестами.
- [ ] 3.6 Ввести `RolePolicy` (system-roles из config — в Domain/Policy), убрать Eloquent-запросы из `RoleController`; `MemberController`/`ProjectUserController` — lookup в queries, ответы через `MemberDTO` + `MemberResource`; проверить project-scope у `ProjectUserController` (возможная cross-tenant утечка — если баг, зафиксировать отдельным issue, не менять поведение молча); проверить тестами ролей/участников.
- [ ] 3.7 `ManifestController`: убрать `$request->validate()` и `fromArray($request->all())` — FormRequest + DTO; `PasswordResetController`/`AuthController` — ответы через JsonResource; удалить пустой `src/Actions/`; переименовать queries на `*Query`.
- [ ] 3.8 Перенести `rules()` всех DTO пакета auth в FormRequests и все ответы контроллеров на JsonResource; снапшот-тесты подтверждают неизменность JSON (успех и 422); прогнать полный гейт auth.

## 4. Pay

- [ ] 4.1 Ввести доменные события `PaymentSucceeded`/`PaymentRefunded` (+ статусные при необходимости) в `Domain/Events/` и синхронные листенеры (ledger, subscription-renewal, analytics); декомпозировать `ApplyPaymentStatusHandler` (86 строк) и `RefundPaymentHandler` (65 строк), идемпотентность оставить в handler; проверить полным циклом платёжных Pest-тестов (создание→оплата→продление→refund).
- [ ] 4.2 Развести коллизию имён: платёжные адаптеры `Infrastructure/Providers/` → `Infrastructure/Gateways/`, обновить `ProviderRegistry` и биндинги; проверить тестами провайдеров.
- [ ] 4.3 `SiteSubscriptionController`: убрать `app(CachedIntrospector::class)` — конструкторная инъекция; `userKey()`-логика → общий introspection-helper (5.2) + VO для tenancy-ключа; enum `Domain/Enums/SubscriptionAction` вместо `in_array` + FormRequest/DTO; `mine()` → query-объект; ownership-проверка → `SubscriptionPolicy`; проверить site-subscription тестами (статусы ошибок неизменны).
- [ ] 4.4 `ProviderWebhookController`: убрать `app(ProviderRegistry::class)`; верификацию подписи и `parseWebhook()` перенести в `HandleWebhookHandler`/gateway-адаптер, ответ через JsonResource; проверить webhook-тестами каждого провайдера.
- [ ] 4.5 Начать использовать `Cms\Shared\Values\Money` в DTO/handlers pay вместо сырых int (без изменения формата API — int minor units на границе); дублированные `find()` в `PaymentController`/`PlanController`/`SubscriptionAdminController` — в queries; удалить пустой `Infrastructure/Support/`.
- [ ] 4.6 Перенести `rules()` всех DTO пакета pay в FormRequests и все ответы контроллеров на JsonResource; снапшот-тесты подтверждают неизменность JSON (успех и 422); прогнать полный гейт pay.

## 5. Shared и кросс-пакетное

- [ ] 5.1 `shared/routes/internal.php`: инлайн-closure `cache-bust` → контроллер + handler; `SendAnalyticsEventJob` → Jobs-namespace; проверить internal-тестами.
- [ ] 5.2 Извлечь общий introspection-helper/middleware в `shared` (заменяет `actorId()`/`currentUser()`/`userKey()` в content/auth/pay); проверить, что все три пакета используют его и их тесты зелёные.
- [ ] 5.3 Перенести сервис-провайдеры всех пакетов в `Infrastructure/Providers/`, обновить composer `extra.laravel.providers`/autoload, `composer dump-autoload`; проверить: `./tools/cms up` поднимает все сервисы, health-эндпоинты отвечают.

## 6. Generators и финализация

- [ ] 6.1 Обновить стабы `MakeModuleCommand` под финальный канон (four-layer, конвейер FormRequest → DTO → Handler → JsonResource, `*Query`-нейминг, провайдер в `Infrastructure/Providers/`); проверить: сгенерированный тестовый модуль проходит структурную проверку и удалён после проверки.
- [ ] 6.2 Финальная верификация: глобальный grep по старым FQCN (нет ссылок), `composer lint && composer stan && composer test` во всех приложениях, `./tools/cms api` собирает swagger без диффа контрактов.
