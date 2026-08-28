<?php

declare(strict_types=1);

use Cms\Pay\Domain\Enums\PaymentStatus;
use Cms\Pay\Domain\Models\Payment;
use Cms\Pay\Domain\Models\Subscription;
use Cms\Pay\Domain\Models\WebhookEvent;
use Illuminate\Support\Facades\Http;

/**
 * Д6: двухфазная верификация callback Platega — форма на приёме,
 * hash_equals секрета в конвейере обработки после резолва по provider_ref.
 * QUEUE_CONNECTION=sync: джоба обработки выполняется прямо в запросе.
 */
function plategaPendingCheckout(): Payment
{
    Http::fake([
        'https://app.platega.io/v2/transaction/process' => Http::response([
            'transactionId' => 'tx-hook-1',
            'status' => 'PENDING',
            'url' => 'https://pay.platega.io/?id=tx-hook-1',
        ]),
    ]);

    $site = actingAsSiteUser();
    payPlategaProject();

    test()->postJson('/api/v1/pay/subscriptions', ['plan_code' => 'pro'], $site)->assertCreated();

    return Payment::acrossProjects()->firstOrFail();
}

function plategaCallbackHeaders(string $secret = 'secret-1'): array
{
    return ['X-MerchantId' => 'merchant-1', 'X-Secret' => $secret];
}

test('platega CONFIRMED callback succeeds the payment and extends the subscription', function () {
    $payment = plategaPendingCheckout();
    $periodBefore = Subscription::acrossProjects()->firstOrFail()->current_period_ends_at;

    $this->postJson('/webhooks/platega', [
        'id' => 'tx-hook-1', 'amount' => 1500.5, 'currency' => 'RUB', 'status' => 'CONFIRMED', 'paymentMethod' => 2,
    ], plategaCallbackHeaders())->assertOk()->assertExactJson(['received' => true]);

    $payment->refresh();
    $subscription = Subscription::acrossProjects()->firstOrFail();
    $event = WebhookEvent::query()->firstOrFail();

    expect($payment->status)->toBe(PaymentStatus::Succeeded)
        ->and($payment->transactions()->count())->toBe(1)
        ->and($subscription->current_period_ends_at->greaterThan($periodBefore))->toBeTrue()
        ->and($event->status)->toBe('processed')
        ->and($event->project_id)->toBe('proj-1')
        ->and($event->auth['secret_hash'] ?? null)->toBe(hash('sha256', 'secret-1'));
});

test('platega callback with wrong secret is rejected before the status is applied', function () {
    $payment = plategaPendingCheckout();

    $this->postJson('/webhooks/platega', [
        'id' => 'tx-hook-1', 'status' => 'CONFIRMED',
    ], plategaCallbackHeaders(secret: 'wrong-secret'))->assertOk();

    $payment->refresh();
    $event = WebhookEvent::query()->firstOrFail();

    expect($payment->status)->toBe(PaymentStatus::Pending)
        ->and($event->status)->toBe('failed')
        ->and($event->project_id)->toBe('proj-1');
});

test('repeated platega callback is idempotent by (provider, external_id)', function () {
    $payment = plategaPendingCheckout();
    $body = ['id' => 'tx-hook-1', 'status' => 'CONFIRMED'];

    $this->postJson('/webhooks/platega', $body, plategaCallbackHeaders())->assertOk();
    $this->postJson('/webhooks/platega', $body, plategaCallbackHeaders())->assertOk()->assertExactJson(['received' => true]);

    $payment->refresh();

    expect(WebhookEvent::query()->count())->toBe(1)
        ->and($payment->status)->toBe(PaymentStatus::Succeeded)
        ->and($payment->transactions()->count())->toBe(1);
});

test('platega callback without form fields is rejected at intake and nothing is stored', function () {
    plategaPendingCheckout();

    // Нет статуса — форма невалидна, событие не регистрируется
    $this->postJson('/webhooks/platega', ['id' => 'tx-hook-1'], plategaCallbackHeaders())
        ->assertStatus(401);

    expect(WebhookEvent::query()->count())->toBe(0);
});

test('platega callback for an unknown transaction fails without applying anything', function () {
    plategaPendingCheckout();

    $this->postJson('/webhooks/platega', ['id' => 'tx-ghost', 'status' => 'CONFIRMED'], plategaCallbackHeaders())
        ->assertOk();

    $event = WebhookEvent::query()->firstOrFail();

    expect($event->status)->toBe('failed')
        ->and($event->project_id)->toBeNull()
        ->and(Payment::acrossProjects()->firstOrFail()->status)->toBe(PaymentStatus::Pending);
});

test('platega CANCELED callback cancels the pending payment', function () {
    $payment = plategaPendingCheckout();

    $this->postJson('/webhooks/platega', ['id' => 'tx-hook-1', 'status' => 'CANCELED'], plategaCallbackHeaders())
        ->assertOk();

    expect($payment->refresh()->status)->toBe(PaymentStatus::Canceled);
});
