---
sessionId: session-260827-190536-vjus
---

# Requirements

### Overview & Goals
Create a central localization registry and sync flow, unify translatable strings across services (content, analytics, pay), and add project settings (language, currencies), analytics provider IDs (Yandex/Google), and payments configuration (Platega only), following strict DDD/CQRS and four-layer architecture.

### Scope
- In Scope:
  - New package `packages/cms/localization` with a registry, persistence, and `localize:sync` command
  - Per-service localization enums and automatic registration at boot (content, analytics, pay)
  - Sync all registered keys into DB and ensure they are consumable in runtime
  - Introduce settings via `spatie/laravel-settings`: current language, currencies (RUB/USD minimum)
  - Analytics settings (Yandex/Google enable + IDs)
  - Payments settings: select Platega; remove delivery/taxes from payments settings API
  - Admin/API endpoints to read/write settings (thin controllers: FormRequest → DTO → Handler → Resource)
- Out of Scope:
  - Frontend/admin UI build; only backend APIs and contracts
  - Changing core payment flows beyond provider selection
  - Historical migration of legacy strings beyond introducing sync and enums

### User Stories
- As an admin, I can run a command to sync all localization keys to a single store.
- As a developer, I can declare a service’s localizable strings via enums and have them auto-registered.
- As an admin, I can set the site’s language and supported currencies.
- As a marketer, I can configure Yandex/Google analytics IDs and enable/disable them.
- As a finance admin, I can choose the Platega provider and I don’t see delivery/tax fields in payments settings.

### Functional Requirements
- Central registry accepts registrations from services at boot and exposes read API with locale fallback.
- Command `php artisan localize:sync` upserts missing/changed keys with a report; idempotent.
- Settings are stored and exposed via handlers/APIs; validation in FormRequests only; DTOs via `spatie/laravel-data`.
- Payments settings exclude delivery/taxes fields completely from API responses and validation schemas.

### Non-Functional Requirements
- Architecture: strict four-layer per package; DTO suffix `DTO`; no `app()/resolve()` in Domain/Application.
- Tenant isolation: all localization rows include `project_id` and use `BelongsToProject` where applicable.
- Security: settings endpoints protected by spatie/permission rights per service; audit significant changes.
- Performance: sync uses batched upserts; index on `(project_id, service, key, locale)`.

# Technical Design

### Current Implementation
- Monorepo with four Laravel apps (auth, content, analytics, pay) behind a gateway; business logic lives in `packages/cms/*` per CLAUDE.md.
- DDD/CQRS, four-layer enforced by `packages/cms/shared/tests/ArchitectureGateTest.php`.

### Key Decisions
- New package `packages/cms/localization` with full four-layer structure; centralized DB table `localization`.
- Registry (`LocalizePort`) as a domain port; infrastructure service to collect registrations at boot; facade `Localize` for convenience in providers.
- Per-service enums define keys; providers call registry in `boot()`.
- `localize:sync` command uses Application handler to upsert keys; idempotent by unique `(project_id, service, key, locale)`.
- Settings via `spatie/laravel-settings`: classes `SiteSettings`, `AnalyticsSettings`, `PaymentsSettings` in a shared/settings package (or `shared` if preferred), exposed via thin HTTP endpoints.
- Remove delivery/taxes fields from payments settings resource/validation.

### Proposed Changes
- Package `packages/cms/localization/src/`:
  - Domain/Models/Localization.php, Domain/Contracts/LocalizePort.php, Domain/Enums/Locale.php (optional)
  - Application/Commands/SyncLocalizations, Application/Handlers/SyncLocalizationsHandler
  - Infrastructure/Persistence/LocalizationRepository (Eloquent), Providers/LocalizationServiceProvider, Console/LocalizeSyncCommand
  - Presentation/Http/Api/V1 (optional read endpoints) with Controllers/Requests/Resources if exposed
- Services (content, analytics, pay): add `Domain/Enums/LocalizationKey.php` and register in their `<Module>ServiceProvider::boot()` via `Localize`.
- Settings (in `packages/cms/shared` or `packages/cms/settings`):
  - `SiteSettings` (language, currency_default, currencies [RUB, USD])
  - `AnalyticsSettings` (yandex_enabled, yandex_id, google_enabled, google_id)
  - `PaymentsSettings` (provider = 'platega')
  - Handlers + thin HTTP endpoints per CLAUDE.md

### Data Models / Contracts
- Table `localization` fields: `id`, `project_id`, `service`, `key`, `locale`, `value`, `default_value`, timestamps; unique index `(project_id, service, key, locale)`.
- `LocalizePort`:
  - `register(string $service, string $locale, array $entries): void`
  - `get(string $service, string $key, string $locale): string|null`

### Components Affected
- packages/cms/content, packages/cms/analytics, packages/cms/pay: add enums; provider boot registration
- packages/cms/shared (or new settings package): settings classes and providers

### File Structure
- packages/cms/localization/src/
  - Domain/{Models,Enums,Contracts}
  - Application/{Commands,Handlers,DTOs}
  - Infrastructure/{Persistence,Providers,Console}
  - Presentation/Http/Api/V1/{Controllers,Requests,Resources}
- packages/cms/{content,analytics,pay}/src/Domain/Enums/LocalizationKey.php
- packages/cms/shared/src/Settings/{SiteSettings,AnalyticsSettings,PaymentsSettings}.php

### Risks
- Key collisions across services → prefix keys by service and enum constants; validation during sync
- Sync performance → batched upsert, proper indexing
- Scope creep in admin endpoints → keep endpoints minimal (settings + optional read for localization) and rights-protected

# Delivery Steps

###   Step 1: scaffold-localization-package-and-migration
Localization package skeleton exists with provider and migration for `localization` table.
- Create `packages/cms/localization` four-layer skeleton and `LocalizationServiceProvider`
- Add Eloquent model and repository interface/impl; add migration with `(project_id, service, key, locale)` unique index
- Verify provider registers and migration runs locally

###   Step 2: implement-registry-and-sync-command
Registry port/service and `php artisan localize:sync` are implemented and idempotent.
- Add `LocalizePort`, infrastructure service, and optional facade `Localize`
- Implement Application `SyncLocalizations` + `SyncLocalizationsHandler`
- Add `Console/LocalizeSyncCommand` wiring to handler; log report of added/updated entries
- Verify with unit tests and a manual run that repeat runs are no-op except changed defaults

###   Step 3: register-service-enums
Each service (content, analytics, pay) declares enums and registers keys at boot.
- In `packages/cms/{content,analytics,pay}`, add `Domain/Enums/LocalizationKey` with constants for all fields
- In each `<Module>ServiceProvider::boot()`, call `Localize->register(<service>, <locale>, [...])`
- Run `localize:sync` and verify keys appear in DB per project

###   Step 4: introduce-settings-and-configure-analytics-payments
Settings classes (site, analytics, payments) created via spatie/laravel-settings and exposed.
- Require and configure `spatie/laravel-settings` at repo level; add settings repository config/provider
- Implement `SiteSettings` (language, currency_default, currencies[RUB,USD]) with handlers + DTOs + endpoints
- Implement `AnalyticsSettings` (enable flags, yandex_id, google_id); add endpoints
- Implement `PaymentsSettings` (provider='platega'); remove delivery/tax fields from payments settings API and resources

###   Step 5: api-wiring-tests-and-ops
APIs wired, delivery/tax fields removed, analytics IDs consumable, and tests/schedule added.
- Expose read endpoints for localization (optional) and ensure settings endpoints follow FormRequest → DTO → Handler → Resource
- Ensure analytics IDs available to rendering/injection layer; document usage
- Add nightly job/schedule for `localize:sync`
- Add tests: sync idempotency, key collision prevention, settings persistence, provider selection