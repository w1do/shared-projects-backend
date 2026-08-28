<?php

declare(strict_types=1);

use Cms\Pay\Application\Commands\RenewSubscriptionCommand;
use Cms\Pay\Application\Handlers\RenewSubscriptionHandler;
use Cms\Pay\Domain\Models\Payment;
use Cms\Pay\Domain\Models\Subscription;

test('site user subscribes to a plan and gets a pending first payment', function () {
    actingAsPayOperator();
    makePlan(['code' => 'pro', 'price_minor' => 19900]);
    $site = actingAsSiteUser();

    $response = $this->postJson('/api/v1/pay/subscriptions', ['plan_code' => 'pro'], $site)->assertCreated();

    expect($response->json('data.subscription.status'))->toBe('active')
        ->and($response->json('data.subscription.plan.code'))->toBe('pro')
        ->and($response->json('data.payment.amount_minor'))->toBe(19900)
        ->and($response->json('data.payment.status'))->toBe('pending');
});

test('full lifecycle: cancel keeps access until period end, resume, pause, delete', function () {
    actingAsPayOperator();
    makePlan(['code' => 'pro']);
    $site = actingAsSiteUser();

    $id = $this->postJson('/api/v1/pay/subscriptions', ['plan_code' => 'pro'], $site)->json('data.subscription.id');

    // cancel: доступ сохраняется до конца оплаченного периода
    $canceled = $this->postJson("/api/v1/pay/subscriptions/{$id}/cancel", [], $site)->assertOk();
    expect($canceled->json('data.status'))->toBe('canceled')
        ->and($canceled->json('data.grants_access'))->toBeTrue();

    // resume до конца периода — снова active
    $this->postJson("/api/v1/pay/subscriptions/{$id}/resume", [], $site)->assertOk()
        ->assertJsonPath('data.status', 'active');

    // pause: доступ заморожен
    $paused = $this->postJson("/api/v1/pay/subscriptions/{$id}/pause", [], $site)->assertOk();
    expect($paused->json('data.status'))->toBe('paused')
        ->and($paused->json('data.grants_access'))->toBeFalse();

    // возобновление после паузы
    $this->postJson("/api/v1/pay/subscriptions/{$id}/resume", [], $site)->assertOk()
        ->assertJsonPath('data.status', 'active');

    // delete — только оператором, soft-delete с сохранением истории
    $headers = actingAsPayOperator();
    $this->postJson("/api/admin/v1/projects/proj-1/pay/subscriptions/{$id}/delete", [], $headers)->assertOk();

    expect(Subscription::acrossProjects()->find($id))->toBeNull()
        ->and(Subscription::acrossProjects()->withTrashed()->find($id))->not->toBeNull();
});

test('duplicate subscription to the same plan is rejected', function () {
    actingAsPayOperator();
    makePlan(['code' => 'pro']);
    $site = actingAsSiteUser();

    $this->postJson('/api/v1/pay/subscriptions', ['plan_code' => 'pro'], $site)->assertCreated();
    $this->postJson('/api/v1/pay/subscriptions', ['plan_code' => 'pro'], $site)->assertStatus(422);
});

test('user cannot manage a subscription of another user', function () {
    actingAsPayOperator();
    makePlan(['code' => 'pro']);
    $site = actingAsSiteUser(userId: '7');
    $id = $this->postJson('/api/v1/pay/subscriptions', ['plan_code' => 'pro'], $site)->json('data.subscription.id');

    $other = actingAsSiteUser(userId: '8');
    $this->postJson("/api/v1/pay/subscriptions/{$id}/cancel", [], $other)->assertNotFound();
});

test('renewal is idempotent per period', function () {
    actingAsPayOperator();
    paySelectProvider('manual');
    $plan = makePlan(['code' => 'pro', 'price_minor' => 1000]);
    $subscription = Subscription::create([
        'project_id' => 'proj-1', 'user_key' => 'user:proj-1:7', 'plan_id' => $plan->id,
        'current_period_ends_at' => now()->subDay(),
    ]);

    $a = app(RenewSubscriptionHandler::class)->handle(new RenewSubscriptionCommand($subscription));
    $b = app(RenewSubscriptionHandler::class)->handle(new RenewSubscriptionCommand($subscription->fresh()));

    expect($a->id)->toBe($b->id)
        ->and(Payment::query()->count())->toBe(1);
});
