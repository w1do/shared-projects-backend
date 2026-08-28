## 1. Localization package scaffold

- [x] 1.1 Verify existing `packages/cms/localization` conforms to four-layer canon; add missing pieces for registry work (config, Console dir); verify provider auto-registers
- [x] 1.2 Add migration for `localization` table (project_id, service, key, locale, value, default_value, timestamps, unique index); verify migrate succeeds

## 2. Registry and sync

- [x] 2.1 Implement `Localize` port + service with `register(service, locale, entries[])`; verify unit test registers keys
- [x] 2.2 Implement `localize:sync` (idempotent upsert, report); verify CLI run outputs added/updated counts and table reflects enums

## 3. Service enums registration (enums live in `cms/contracts`, registered via `cms-localization.registries` config)

- [x] 3.1 Content: create `Cms\Contracts\Localization\ContentLocalizationKeys` and register via config; verify keys appear after sync
- [x] 3.2 Analytics: create `Cms\Contracts\Localization\AnalyticsLocalizationKeys` and register; verify keys appear after sync
- [x] 3.3 Pay: create `Cms\Contracts\Localization\PayLocalizationKeys` and register; verify keys appear after sync

## 4. Settings via spatie/laravel-settings

- [x] 4.1 Require `spatie/laravel-settings`; tenant-scoped repository in `cms/shared` (settings table with project_id); verify settings migration
- [x] 4.2 Implement `SiteSettings` in cms/auth (language, currency_default, currencies[RUB,USD]); verify CRUD through handlers/API
- [x] 4.3 Implement `AnalyticsSettings` in cms/analytics (enabled flags, yandex_id, google_id); verify values persist and can be read by services
- [x] 4.4 Implement `PaymentsSettings` in cms/pay (provider='platega'); verify provider read in pay service

## 5. Admin/API integration

- [x] 5.1 Expose read endpoints/handlers for settings and localization read; verify Swagger includes endpoints
- [x] 5.2 Remove Shipping/Taxes mock tabs from console (paired `frontends/admin` + `frontends/source-admin`); keep payments settings API free of delivery/tax fields
- [x] 5.3 Expose analytics IDs via public analytics-service config endpoint (frontend injection path); verify IDs match settings

## 6. QA and operations

- [x] 6.1 Add nightly job to run `localize:sync` + supervisor `schedule:work` runner for content-service; verify schedule config
- [x] 6.2 Add tests: sync idempotency, settings persistence, provider selection; verify test suite passes
