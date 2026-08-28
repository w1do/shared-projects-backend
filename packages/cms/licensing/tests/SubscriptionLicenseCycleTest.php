<?php

declare(strict_types=1);

use Cms\Licensing\Domain\Models\License;
use Cms\Licensing\Domain\Models\Organization;
use Cms\Licensing\Domain\Models\Plan;
use Cms\Pay\Application\Commands\RenewSubscriptionCommand;
use Cms\Pay\Application\Handlers\RenewSubscriptionHandler;
use Cms\Pay\Domain\Models\Subscription;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Support\Carbon;

/** Сквозной цикл Д10: подписка организации ⇄ perpetual-лицензия. */
function cycleOperator(): array
{
    return actingAsPayOperator(permissions: [
        'pay.subscriptions.view', 'pay.subscriptions.manage',
        'pay.payments.view', 'pay.payments.confirm',
        'pay.licensing.view', 'pay.licensing.manage',
    ]);
}

function cycleSubscribePayload(Organization $organization, Plan $plan): array
{
    return [
        'subscriber_type' => 'organization',
        'subscriber_id' => (string) $organization->id,
        'subject_type' => 'license_plan',
        'subject_id' => (string) $plan->id,
        'provider' => 'manual',
    ];
}

test('organization subscription cycle: issue, renew, cancel and revoke are independent', function () {
    Carbon::setTestNow('2026-09-01 12:00:00');
    $headers = cycleOperator();
    paySelectProvider('manual'); // провайдер продления — из настроек проекта
    app(ProjectContext::class)->set('proj-1');
    $organization = Organization::factory()->create();
    $plan = Plan::factory()->priced(49900, 'RUB', 'month')->create();
    $plan->features()->create(['project_id' => 'proj-1', 'code' => 'api-access', 'name' => 'API']);

    // Оформление подписки организации на лицензионный план, провайдер manual
    $checkout = $this->postJson('/api/admin/v1/projects/proj-1/pay/subscriptions',
        cycleSubscribePayload($organization, $plan), $headers)->assertCreated();

    expect($checkout->json('data.subscription.subscriber'))
        ->toBe(['type' => 'organization', 'id' => (string) $organization->id])
        ->and($checkout->json('data.subscription.subject.type'))->toBe('license_plan')
        ->and($checkout->json('data.payment.provider'))->toBe('manual')
        ->and($checkout->json('data.payment.amount_minor'))->toBe(49900);

    // Лицензия выпущена автоматически: окно обновлений = конец оплаченного периода
    $subscription = Subscription::query()->sole();
    $license = License::query()->sole();
    $keyHash = $license->key_hash;
    expect($license->organization_id)->toBe($organization->id)
        ->and($license->plan_id)->toBe($plan->id)
        ->and($license->updates_until->toDateString())
        ->toBe($subscription->current_period_ends_at->toDateString())
        ->and($license->features)->toBe(['api-access'])
        ->and($license->key_encrypted)->not->toBeNull();

    // Оплата продления: период истёк, джоба создаёт платёж, оператор подтверждает
    Carbon::setTestNow('2026-10-05 12:00:00');
    $subscription->refresh();
    $renewal = app(RenewSubscriptionHandler::class)->handle(new RenewSubscriptionCommand($subscription));
    $this->postJson("/api/admin/v1/projects/proj-1/pay/payments/{$renewal->id}/confirm", [], $headers)->assertOk();

    // Период сдвинут И окно обновлений лицензии сдвинуто, ключ прежний
    $subscription->refresh();
    $license->refresh();
    expect($subscription->current_period_ends_at->toIso8601String())->toBe('2026-11-05T12:00:00+00:00')
        ->and($license->updates_until->toDateString())->toBe('2026-11-05')
        ->and($license->key_hash)->toBe($keyHash);

    // Отмена подписки лицензию не трогает: она бессрочна, замирает только окно
    $this->postJson("/api/admin/v1/projects/proj-1/pay/subscriptions/{$subscription->id}/cancel", [], $headers)
        ->assertOk();
    $license->refresh();
    expect($license->status()->value)->toBe('active')
        ->and($license->updates_until->toDateString())->toBe('2026-11-05');

    // Лицензия живёт и после конца оплаченного периода — истекает только окно
    Carbon::setTestNow('2027-01-01 12:00:00');
    expect($license->status()->value)->toBe('active')
        ->and($license->activationState())->toBe('updates_expired');

    // Отзыв лицензии подписку не меняет
    $this->postJson("/api/admin/v1/projects/proj-1/pay/licensing/licenses/{$license->id}/revoke", [], $headers)
        ->assertOk();
    expect($license->fresh()->status()->value)->toBe('revoked')
        ->and($subscription->fresh()->status->value)->toBe('canceled')
        ->and(Subscription::query()->count())->toBe(1);

    Carbon::setTestNow();
});

test('license plan without price cannot be subscribed', function () {
    $headers = cycleOperator();
    app(ProjectContext::class)->set('proj-1');
    $organization = Organization::factory()->create();
    $plan = Plan::factory()->create(); // без цены — только ручной выпуск

    $this->postJson('/api/admin/v1/projects/proj-1/pay/subscriptions',
        cycleSubscribePayload($organization, $plan), $headers)->assertStatus(422);

    expect(License::query()->count())->toBe(0)
        ->and(Subscription::query()->count())->toBe(0);
});

test('foreign project organization cannot be subscribed', function () {
    $headers = cycleOperator();
    app(ProjectContext::class)->set('proj-2');
    $foreign = Organization::factory()->create(['project_id' => 'proj-2']);
    app(ProjectContext::class)->set('proj-1');
    $plan = Plan::factory()->priced()->create();

    $response = $this->postJson('/api/admin/v1/projects/proj-1/pay/subscriptions',
        cycleSubscribePayload($foreign, $plan), $headers)->assertStatus(422);

    expect($response->json('error.details.subscriber.0'))->toBe('Unknown subscriber.')
        ->and(Subscription::query()->count())->toBe(0);
});
