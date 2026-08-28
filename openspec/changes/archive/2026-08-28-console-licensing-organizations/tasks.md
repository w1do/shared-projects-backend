# Tasks: console-licensing-organizations

## 1. Платформа: реестр сервисов и включённость по умолчанию

- [x] 1.1 Добавить `case Licensing = 'licensing'` в `ServiceName` и ключ в `toggleable()` (`packages/cms/auth/src/Domain/Enums/ServiceName.php`); проверить юнит-тестом, что `config('cms-auth.services')` содержит `licensing`, а `PUT .../services/licensing` принимает переключение (feature-тест auth-service).
- [x] 1.2 Ввести `default_enabled_services` в `packages/cms/auth/config/cms-auth.php` (значение `['licensing']`) и сидинг строк `project_services` в `CreateProjectHandler`; feature-тест: у только что созданного проекта сервис `licensing` включён, остальные — нет.
- [x] 1.3 Идемпотентная data-миграция auth-service: вставить `project_services (licensing, enabled=true)` всем проектам без такой строки; тест миграции (существующая строка `enabled=false` не перезаписывается, повторный прогон ничего не меняет); `./tools/cms migrate` проходит без ошибок.
- [x] 1.4 Feature-тест сохранения явного выключения: после `PUT {enabled:false}` сервис остаётся выключенным в `GET /services` и не включается обратно автоматически.

## 2. Манифест и сервисный гейт лицензирования

- [x] 2.1 Создать `LicensingManifest` (ключ `licensing`, версия, nav-пункт «Лицензирование» с правом `pay.licensing.view`; группа прав остаётся в `PayManifest`) и команду публикации по образцу существующих `PublishManifestCommand`; сперва проверить валидацию `PublishManifestHandler` на nav-право с префиксом `pay.` (риск из design Д2); feature-тест: после публикации и включения сервиса bootstrap отдаёт сервис `licensing` с навигацией, при выключенном — не отдаёт.
- [x] 2.2 Сменить гейт в `packages/cms/licensing/routes/admin.php` на `EnsureServiceEnabled:licensing`; feature-тесты: licensing выключен → admin-маршруты 404 (данные целы после включения); `pay` выключен + `licensing` включён → licensing-маршруты работают; публичный `POST /api/v1/pay/licensing/validate` отвечает как обычно при выключенном `licensing`.
- [x] 2.3 Добавить публикацию licensing-манифеста во все места, где публикуются остальные манифесты (entrypoint стека, `tools/smoke.sh`, `e2e/support/platform.ts` — найти по вызовам существующих команд); проверить `tools/smoke.sh` зелёный.
- [x] 2.4 Переснять снимки `RouteCoverageTest`/характеризационные тесты pay-service, если фиксируют middleware; полный прогон `./tools/cms test pay` и `./tools/cms test auth` зелёный.

## 3. Консоль: слой данных и доступ к разделу

- [x] 3.1 Модуль `frontends/admin/src/lib/admin/data-source/platform/licensing.ts` (организации CRUD, планы CRUD, фичи/переопределения, лицензии: список с фильтрами/выпуск/отзыв, файл лицензии blob'ом, публичный ключ подписи) + типы; только в admin-дереве; проверка — node-тесты по образцу соседних platform-модулей (`bun run test` в `frontends/admin`).
- [x] 3.2 Фасад в `lib/admin/services/**`, ключи запросов в `lib/admin/query/keys.ts`, hooks `hooks/admin/licensing/*` (queries + мутации с тостами и инвалидацией, `canManage` по `pay.licensing.manage`/`*`); node-тесты hooks/фасада проходят.
- [x] 3.3 `section-access.ts`: ключ `licensing` в `CONSOLE_SECTION_KEYS`, `SECTION_REQUIREMENTS.licensing = {service: "licensing", permission: "pay.licensing.view"}`; обновить `section-access.test.ts` (видимость по сервису+праву, скрытие при выключенном сервисе) — тесты зелёные.
- [x] 3.4 `sidebar-config.ts`: пункт «Лицензирование» в группе commerce (`t("console.nav.licensing")`, `url: /admin/licensing`, `section: "licensing"`); пункт появляется/исчезает по снимку секций (проверка через существующие тесты `use-visible-navigation`/section-access).

## 4. Консоль: экраны раздела и тумблер сервиса

- [x] 4.1 Каркас раздела: `app/admin/licensing/page.tsx` (thin wrapper + metadata из `t()`) и `components/pages/licensing/index.tsx` с вкладками «Организации / Планы / Лицензии» из существующих компонентов вёрстки (Tabs, таблицы, диалоги — как settings/customers); страница открывается без ошибок консоли браузера.
- [x] 4.2 Вкладка «Организации»: список с cursor-пагинацией, модалка создания/редактирования анкеты, удаление с подтверждением; ошибки валидации и доменная ошибка «есть лицензии» показываются тостом/в форме; ручная проверка сценариев спека `console-licensing-ui` + node-тесты.
- [x] 4.3 Вкладка «Планы»: CRUD плана (code, название, цена-тройка «все или ничего» с клиентской подсказкой), базовые фичи и пер-организационные переопределения в просмотре плана; ошибка частичной цены отображается; проверка по сценариям спека.
- [x] 4.4 Вкладка «Лицензии»: список (организация, план, ключ, даты, статус) с фильтрами по организации и статусу, выпуск (организация+план+срок), отзыв с подтверждением, скачивание `.lic` через авторизованный fetch→blob, просмотр публичного ключа подписи; повторный отзыв показывает доменную ошибку; проверка по сценариям спека.
- [x] 4.5 Режим «только чтение» без `pay.licensing.manage`: изменяющие действия, скачивание файла и ключ подписи недоступны; проверить оператором с ролью только-view.
- [x] 4.6 Тумблер сервиса: `licensing` в `SERVICE_TEXTS` (`ServicesSection.tsx`) и тексты `console.settings.services.licensing.*`, `console.nav.licensing`, блок `console.licensing.*` в `console-texts.ts`; `console-texts.test.ts` зелёный; выключение тумблера скрывает раздел из меню сразу (без повторного входа).
- [x] 4.7 Зеркалирование: все новые/изменённые файлы `src/app/**`, `src/components/**`, `hooks/**`, `sidebar-config.ts`, `section-access.ts`, `console-texts.ts` идентичны в `frontends/admin` и `frontends/source-admin`; `diff -rq frontends/admin/src frontends/source-admin/src` показывает расхождения только в известном admin-only списке (`data-source/platform/**` и т.п.).

## 5. Сквозная проверка

- [x] 5.1 e2e: «Лицензирование» в массиве `VISIBLE` `e2e/tests/console-navigation.spec.ts`; при необходимости — включение сервиса в `e2e/support/platform.ts` (или полагание на дефолт); e2e-прогон зелёный.
- [x] 5.2 Живая проверка: `./tools/cms migrate`, публикация манифестов, restart admin-front (дождаться «Ready»), браузером (playwright) пройти: раздел виден, CRUD организации, выпуск+отзыв лицензии, тумблер в «Сервисы проекта» скрывает раздел.
- [x] 5.3 Полные прогоны качества: `composer lint`, `composer stan`, `./tools/cms test` по всем сервисам, `bun run test` фронта; убедиться, что `openapi/*.json` не изменились (`git diff` пуст по swagger) и `tools/smoke.sh` зелёный.
