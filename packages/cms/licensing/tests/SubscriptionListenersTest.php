<?php

declare(strict_types=1);

use Cms\Contracts\Events\SubscriptionPeriodExtended;
use Cms\Contracts\Events\SubscriptionStarted;
use Cms\Licensing\Application\Listeners\IssueLicenseOnSubscriptionStarted;
use Cms\Licensing\Application\Listeners\ReissueLicenseOnPeriodExtended;
use Cms\Licensing\Domain\Models\License;
use Cms\Licensing\Domain\Models\Organization;
use Cms\Licensing\Domain\Models\Plan;
use Cms\Shared\Tenant\ProjectContext;

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
    $this->plan = Plan::factory()->priced()->create();
});

test('subscription started issues a license until the paid period end', function () {
    $endsAt = now()->addMonth()->toIso8601String();

    app(IssueLicenseOnSubscriptionStarted::class)
        ->handle(licensingStartedEvent($this->organization, $this->plan, $endsAt));

    $license = License::query()->sole();
    expect($license->organization_id)->toBe($this->organization->id)
        ->and($license->plan_id)->toBe($this->plan->id)
        ->and($license->expires_at->toIso8601String())->toBe($endsAt)
        ->and($license->payload()['plan'])->toBe($this->plan->code);
});

test('subscription started listener is idempotent', function () {
    $endsAt = now()->addMonth()->toIso8601String();
    $event = licensingStartedEvent($this->organization, $this->plan, $endsAt);
    $listener = app(IssueLicenseOnSubscriptionStarted::class);

    $listener->handle($event);
    $key = License::query()->sole()->key;
    $listener->handle($event);

    $license = License::query()->sole(); // второй лицензии нет
    expect($license->key)->toBe($key)
        ->and($license->expires_at->toIso8601String())->toBe($endsAt);
});

test('existing unrevoked license is extended instead of duplicated, even expired', function () {
    $existing = License::factory()->expired()->create([
        'organization_id' => $this->organization->id,
        'plan_id' => $this->plan->id,
    ]);
    $endsAt = now()->addMonth()->toIso8601String();

    app(IssueLicenseOnSubscriptionStarted::class)
        ->handle(licensingStartedEvent($this->organization, $this->plan, $endsAt));

    $license = License::query()->sole();
    expect($license->id)->toBe($existing->id)
        ->and($license->key)->toBe($existing->key)
        ->and($license->expires_at->toIso8601String())->toBe($endsAt);
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

test('period extension reissues payload with the new expiry and same key', function () {
    $license = License::factory()->create([
        'organization_id' => $this->organization->id,
        'plan_id' => $this->plan->id,
    ]);
    $originalKey = $license->key;
    $endsAt = now()->addMonths(2)->toIso8601String();

    app(ReissueLicenseOnPeriodExtended::class)
        ->handle(licensingExtendedEvent($this->organization, $this->plan, $endsAt));

    $fresh = $license->fresh();
    expect($fresh->key)->toBe($originalKey)
        ->and($fresh->expires_at->toIso8601String())->toBe($endsAt)
        ->and($fresh->payload()['expires_at'])->toBe($endsAt)
        ->and($fresh->payload()['key'])->toBe($originalKey);
});

test('period extension listener is idempotent', function () {
    $license = License::factory()->create([
        'organization_id' => $this->organization->id,
        'plan_id' => $this->plan->id,
    ]);
    $endsAt = now()->addMonths(2)->toIso8601String();
    $event = licensingExtendedEvent($this->organization, $this->plan, $endsAt);
    $listener = app(ReissueLicenseOnPeriodExtended::class);

    $listener->handle($event);
    $first = $license->fresh()->signed_payload;
    $listener->handle($event);

    expect(License::query()->count())->toBe(1)
        ->and($license->fresh()->expires_at->toIso8601String())->toBe($endsAt)
        ->and($license->fresh()->payload())->toBe(
            License::query()->sole()->payload(),
        );
});

test('revoked license is not resurrected by payment events', function () {
    $revoked = License::factory()->revoked()->create([
        'organization_id' => $this->organization->id,
        'plan_id' => $this->plan->id,
    ]);
    $originalExpiry = $revoked->expires_at->toIso8601String();
    $originalPayload = $revoked->signed_payload;
    $endsAt = now()->addMonths(3)->toIso8601String();

    app(ReissueLicenseOnPeriodExtended::class)
        ->handle(licensingExtendedEvent($this->organization, $this->plan, $endsAt));

    $fresh = $revoked->fresh();
    expect($fresh->status()->value)->toBe('revoked')
        ->and($fresh->expires_at->toIso8601String())->toBe($originalExpiry)
        ->and($fresh->signed_payload)->toBe($originalPayload)
        ->and(License::query()->count())->toBe(1);
});
