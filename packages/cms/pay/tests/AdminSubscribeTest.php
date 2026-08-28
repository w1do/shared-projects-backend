<?php

declare(strict_types=1);

use Cms\Pay\Domain\Models\Payment;
use Cms\Pay\Domain\Models\Subscription;

/** Admin-оформление подписки (Д16): полиморфные подписчик и предмет. */
function adminSubscribePayload(array $overrides = []): array
{
    return array_merge([
        'subscriber_type' => 'site_user',
        'subscriber_id' => '7',
        'subject_type' => 'plan',
        'provider' => 'manual',
    ], $overrides);
}

test('operator subscribes a site user to a plan with the manual provider', function () {
    $headers = actingAsPayOperator();
    $plan = makePlan(['code' => 'pro', 'price_minor' => 19900]);

    $response = $this->postJson(
        '/api/admin/v1/projects/proj-1/pay/subscriptions',
        adminSubscribePayload(['subject_id' => (string) $plan->id]),
        $headers,
    )->assertCreated();

    expect($response->json('data.subscription.subscriber'))->toBe(['type' => 'site_user', 'id' => '7'])
        ->and($response->json('data.subscription.subject.type'))->toBe('plan')
        ->and($response->json('data.subscription.subject.code'))->toBe('pro')
        ->and($response->json('data.payment.provider'))->toBe('manual')
        ->and($response->json('data.payment.amount_minor'))->toBe(19900)
        ->and($response->json('data.payment.status'))->toBe('pending');

    $subscription = Subscription::query()->sole();
    expect($subscription->subscriber_type)->toBe('site_user')
        ->and(Payment::query()->sole()->subject_key)->toBe('user:proj-1:7');
});

test('provider falls back to the project payments settings when omitted', function () {
    $headers = actingAsPayOperator();
    paySelectProvider('manual'); // провайдер проекта в настройках платежей
    $plan = makePlan(['code' => 'pro', 'price_minor' => 1000]);

    $payload = adminSubscribePayload(['subject_id' => (string) $plan->id]);
    unset($payload['provider']);

    $this->postJson('/api/admin/v1/projects/proj-1/pay/subscriptions', $payload, $headers)->assertCreated();

    expect(Payment::query()->sole()->provider)->toBe('manual');
});

test('unresolvable subject is rejected with a domain validation error', function () {
    $headers = actingAsPayOperator();

    $response = $this->postJson(
        '/api/admin/v1/projects/proj-1/pay/subscriptions',
        adminSubscribePayload(['subject_id' => '999']),
        $headers,
    )->assertStatus(422);

    expect($response->json('error.details.subject.0'))->toBe('Unknown or non-subscribable subject.');
});

test('unknown subscriber type is rejected', function () {
    $headers = actingAsPayOperator();
    $plan = makePlan(['code' => 'pro']);

    $this->postJson(
        '/api/admin/v1/projects/proj-1/pay/subscriptions',
        adminSubscribePayload(['subscriber_type' => 'ghost', 'subject_id' => (string) $plan->id]),
        $headers,
    )->assertStatus(422);
});

test('operator without manage permission gets 403', function () {
    $headers = actingAsPayOperator(permissions: ['pay.subscriptions.view']);
    $plan = makePlan(['code' => 'pro']);

    $this->postJson(
        '/api/admin/v1/projects/proj-1/pay/subscriptions',
        adminSubscribePayload(['subject_id' => (string) $plan->id]),
        $headers,
    )->assertForbidden();
});

test('duplicate live subscription for the same pair is rejected', function () {
    $headers = actingAsPayOperator();
    $plan = makePlan(['code' => 'pro']);
    $payload = adminSubscribePayload(['subject_id' => (string) $plan->id]);

    $this->postJson('/api/admin/v1/projects/proj-1/pay/subscriptions', $payload, $headers)->assertCreated();
    $response = $this->postJson('/api/admin/v1/projects/proj-1/pay/subscriptions', $payload, $headers)->assertStatus(422);

    expect($response->json('error.details.plan_code.0'))->toBe('Subscription already exists.');
});
