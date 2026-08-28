<?php

declare(strict_types=1);

use Cms\Contracts\Events\SubscriptionPeriodExtended;
use Cms\Contracts\Events\SubscriptionStarted;
use Cms\Licensing\Application\Listeners\IssueLicenseOnSubscriptionStarted;
use Cms\Licensing\Application\Listeners\RenewLicenseOnPeriodExtended;
use Cms\Licensing\Domain\Models\License;
use Cms\Licensing\Domain\Models\Organization;
use Cms\Licensing\Domain\Models\Plan;
use Cms\Licensing\Domain\Models\Release;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Support\Facades\Crypt;

function licensingStartedEvent(Organization $organization, Plan $plan, string $endsAt): SubscriptionStarted
{
    return new SubscriptionStarted(
        subscriptionId: '01JSUB000000000000000000AA',
        projectId: 'proj-1',
        subscriberType: 'organization',
        subscriberId: (string) $organization->id,
        subjectType: 'license_plan',
        subjectId: (string) $plan->id,
        periodEndsAt: $endsAt,
    );
}

function licensingExtendedEvent(Organization $organization, Plan $plan, string $endsAt): SubscriptionPeriodExtended
{
    return new SubscriptionPeriodExtended(
        subscriptionId: '01JSUB000000000000000000AA',
        projectId: 'proj-1',
        subscriberType: 'organization',
        subscriberId: (string) $organization->id,
        subjectType: 'license_plan',
        subjectId: (string) $plan->id,
        periodEndsAt: $endsAt,
    );
}

beforeEach(function () {
    app(ProjectContext::class)->set('proj-1');
    $this->organization = Organization::factory()->create();
    $this->plan = Plan::factory()->priced()->create(['code' => 'pro']);
});

// ------------------------------------------------------- старт подписки (Д10)

test('subscription start issues a perpetual license with the paid period as updates window', function () {
    $this->plan->features()->create(['project_id' => 'proj-1', 'code' => 'api-access', 'name' => 'API']);
    Release::factory()->version('1.4.7')->create(['released_at' => now()->subDay()]);
    $endsAt = now()->addMonth();

    app(IssueLicenseOnSubscriptionStarted::class)
        ->handle(licensingStartedEvent($this->organization, $this->plan, $endsAt->toIso8601String()));

    $license = License::query()->sole();
    expect($license->organization_id)->toBe($this->organization->id)
        ->and($license->plan_id)->toBe($this->plan->id)
        ->and($license->updates_until->toDateString())->toBe($endsAt->toDateString())
        ->and($license->edition)->toBe('pro')
        ->and($license->features)->toBe(['api-access'])
        ->and($license->entitled_version)->toBe('1.4.7')
        ->and($license->max_installations)->toBe(1);

    // ключ некому вернуть — он ждёт первого показа шифрованным (Д8)
    expect($license->key_encrypted)->not->toBeNull()
        ->and(Crypt::decryptString((string) $license->key_encrypted))->toMatch('/^LIC(-[A-HJ-NP-Z2-9]{4}){4}$/');
});

test('subscription started listener is idempotent', function () {
    $endsAt = now()->addMonth()->toIso8601String();
    $event = licensingStartedEvent($this->organization, $this->plan, $endsAt);
    $listener = app(IssueLicenseOnSubscriptionStarted::class);

    $listener->handle($event);
    $hash = License::query()->sole()->key_hash;
    $listener->handle($event);

    $license = License::query()->sole(); // второй лицензии нет
    expect($license->key_hash)->toBe($hash);
});

test('existing unrevoked license is renewed instead of duplicated, even with an expired window', function () {
    $existing = License::factory()->updatesExpired()->create([
        'organization_id' => $this->organization->id,
        'plan_id' => $this->plan->id,
    ]);
    $endsAt = now()->addMonth();

    app(IssueLicenseOnSubscriptionStarted::class)
        ->handle(licensingStartedEvent($this->organization, $this->plan, $endsAt->toIso8601String()));

    $license = License::query()->sole();
    expect($license->id)->toBe($existing->id)
        ->and($license->key_hash)->toBe($existing->key_hash)
        ->and($license->updates_until->toDateString())->toBe($endsAt->toDateString());
});

test('foreign subscription events are ignored', function () {
    $listener = app(IssueLicenseOnSubscriptionStarted::class);

    // тарифный план pay — не предмет licensing
    $planEvent = new SubscriptionStarted(
        subscriptionId: 's1', projectId: 'proj-1',
        subscriberType: 'site_user', subscriberId: '7',
        subjectType: 'plan', subjectId: '1',
        periodEndsAt: now()->addMonth()->toIso8601String(),
    );
    // организация на тарифный план pay — тоже мимо
    $mixedEvent = new SubscriptionStarted(
        subscriptionId: 's2', projectId: 'proj-1',
        subscriberType: 'organization', subscriberId: (string) $this->organization->id,
        subjectType: 'plan', subjectId: '1',
        periodEndsAt: now()->addMonth()->toIso8601String(),
    );

    $listener->handle($planEvent);
    $listener->handle($mixedEvent);

    expect(License::query()->count())->toBe(0);
});

// ----------------------------------------------------- продление периода (Д10)

test('period extension moves the updates window and raises the entitled version', function () {
    $license = License::factory()->create([
        'organization_id' => $this->organization->id,
        'plan_id' => $this->plan->id,
        'entitled_version' => '1.2.0',
        'updates_until' => now()->addDays(3)->toDateString(),
    ]);
    Release::factory()->version('1.4.7')->create(['released_at' => now()->subDay()]);
    $endsAt = now()->addMonths(2);

    app(RenewLicenseOnPeriodExtended::class)
        ->handle(licensingExtendedEvent($this->organization, $this->plan, $endsAt->toIso8601String()));

    $fresh = $license->fresh();
    expect($fresh->key_hash)->toBe($license->key_hash)
        ->and($fresh->updates_until->toDateString())->toBe($endsAt->toDateString())
        ->and($fresh->entitled_version)->toBe('1.4.7');
});

test('period extension listener is idempotent', function () {
    $license = License::factory()->create([
        'organization_id' => $this->organization->id,
        'plan_id' => $this->plan->id,
        'updates_until' => now()->addDays(3)->toDateString(),
    ]);
    $endsAt = now()->addMonths(2);
    $event = licensingExtendedEvent($this->organization, $this->plan, $endsAt->toIso8601String());
    $listener = app(RenewLicenseOnPeriodExtended::class);

    $listener->handle($event);
    $listener->handle($event); // повтор того же срока — noop, не доменная ошибка

    expect(License::query()->count())->toBe(1)
        ->and($license->fresh()->updates_until->toDateString())->toBe($endsAt->toDateString());
});

test('revoked license is not resurrected by payment events', function () {
    $revoked = License::factory()->revoked()->create([
        'organization_id' => $this->organization->id,
        'plan_id' => $this->plan->id,
    ]);
    $originalWindow = $revoked->updates_until->toDateString();

    app(RenewLicenseOnPeriodExtended::class)
        ->handle(licensingExtendedEvent($this->organization, $this->plan, now()->addMonths(3)->toIso8601String()));

    $fresh = $revoked->fresh();
    expect($fresh->status()->value)->toBe('revoked')
        ->and($fresh->updates_until->toDateString())->toBe($originalWindow)
        ->and(License::query()->count())->toBe(1);
});

// -------------------------------------- perpetual: жизнь после конца периода

test('license outlives the paid period end', function () {
    $license = License::factory()->create([
        'organization_id' => $this->organization->id,
        'plan_id' => $this->plan->id,
        'updates_until' => now()->subDay()->toDateString(),
    ]);

    // окно истекло, но лицензия активна и выдаёт licensed-совместимые состояния
    expect($license->status()->value)->toBe('active')
        ->and($license->activationState())->toBe('updates_expired');
});
