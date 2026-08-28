<?php

declare(strict_types=1);

use Cms\Pay\Application\Commands\RefundPaymentCommand;
use Cms\Pay\Application\DTOs\Payment\RefundDTO;
use Cms\Pay\Application\Handlers\RefundPaymentHandler;
use Cms\Pay\Domain\Models\Payment;
use Cms\Shared\Analytics\AnalyticsRecorder;
use Cms\Shared\Jobs\SendAnalyticsEventJob;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Http;

/** Д8: детальный след платежа — payment.initiated и обогащённые props результата. */
function payAnalyticsFake(): void
{
    config(['cms.analytics_url' => 'http://analytics-service:8000']);
    app()->forgetInstance(AnalyticsRecorder::class);
    Bus::fake([SendAnalyticsEventJob::class]);
}

/** @return list<array<string, mixed>> */
function payAnalyticsEvents(?string $name = null): array
{
    $events = [];
    Bus::assertDispatched(SendAnalyticsEventJob::class, function (SendAnalyticsEventJob $job) use (&$events, $name): bool {
        if ($name === null || $job->event['name'] === $name) {
            $events[] = $job->event;
        }

        return true;
    });

    return $events;
}

test('payment.initiated is pushed with subject, amount and plan props', function () {
    payAnalyticsFake();

    $site = actingAsSiteUser();
    app(ProjectContext::class)->set('proj-1');
    $plan = makePlan(['code' => 'pro', 'name' => 'Pro', 'price_minor' => 1000, 'currency' => 'RUB']);
    app(ProjectContext::class)->clear();

    $this->postJson('/api/v1/pay/subscriptions', ['plan_code' => 'pro'], $site)->assertCreated();

    $payment = Payment::acrossProjects()->firstOrFail();
    [$event] = payAnalyticsEvents('payment.initiated');

    expect($event['subject_key'])->toBe('user:proj-1:7')
        ->and($event['project_id'])->toBe('proj-1')
        ->and($event['value_minor'])->toBe(1000)
        ->and($event['currency'])->toBe('RUB')
        ->and($event['props'])->toBe([
            'payment_id' => $payment->id,
            'provider' => 'manual',
            'plan_id' => $plan->id,
            'plan_name' => 'Pro',
            'subscription_id' => $payment->subscription_id,
        ]);
});

test('payment.failed carries the provider error code in props', function () {
    Http::fake([
        'https://app.platega.io/v2/transaction/process' => Http::response(['code' => 'LIMIT_EXCEEDED'], 502),
    ]);
    payAnalyticsFake();

    $site = actingAsSiteUser();
    payPlategaProject();

    $this->postJson('/api/v1/pay/subscriptions', ['plan_code' => 'pro'], $site)->assertCreated();

    [$event] = payAnalyticsEvents('payment.failed');

    expect($event['props']['provider'])->toBe('platega')
        ->and($event['props']['plan_name'])->not->toBeNull()
        ->and($event['props']['subscription_id'])->not->toBeNull()
        ->and($event['props']['error'])->toBe([
            'code' => 'LIMIT_EXCEEDED',
            'message' => 'Provider [platega] request failed with HTTP 502.',
        ]);
});

test('payment.succeeded props include provider, plan and subscription', function () {
    Http::fake([
        'https://app.platega.io/v2/transaction/process' => Http::response([
            'transactionId' => 'tx-an-1', 'status' => 'PENDING', 'url' => 'https://pay.platega.io/?id=tx-an-1',
        ]),
    ]);
    payAnalyticsFake();

    $site = actingAsSiteUser();
    payPlategaProject();
    $this->postJson('/api/v1/pay/subscriptions', ['plan_code' => 'pro'], $site)->assertCreated();

    $this->postJson('/webhooks/platega', ['id' => 'tx-an-1', 'status' => 'CONFIRMED'], [
        'X-MerchantId' => 'merchant-1', 'X-Secret' => 'secret-1',
    ])->assertOk();

    $payment = Payment::acrossProjects()->firstOrFail();
    [$event] = payAnalyticsEvents('payment.succeeded');

    expect($event['value_minor'])->toBe(150050)
        ->and($event['currency'])->toBe('RUB')
        ->and($event['props']['payment_id'])->toBe($payment->id)
        ->and($event['props']['provider'])->toBe('platega')
        ->and($event['props']['plan_name'])->toBe($payment->subscription->plan->name)
        ->and($event['props']['subscription_id'])->toBe($payment->subscription_id)
        ->and($event['props'])->not->toHaveKey('error');
});

test('payment.refunded props include provider, plan and subscription', function () {
    payAnalyticsFake();

    $site = actingAsSiteUser();
    app(ProjectContext::class)->set('proj-1');
    makePlan(['code' => 'pro', 'price_minor' => 1000]);
    app(ProjectContext::class)->clear();

    $this->postJson('/api/v1/pay/subscriptions', ['plan_code' => 'pro'], $site)->assertCreated();

    $headers = actingAsPayOperator();
    $payment = Payment::acrossProjects()->firstOrFail();
    $this->postJson("/api/admin/v1/projects/proj-1/pay/payments/{$payment->id}/confirm", [], $headers)->assertOk();
    $this->postJson("/api/admin/v1/projects/proj-1/pay/payments/{$payment->id}/refund", [], $headers)->assertOk();

    [$event] = payAnalyticsEvents('payment.refunded');

    expect($event['value_minor'])->toBe(-1000)
        ->and($event['props']['payment_id'])->toBe($payment->id)
        ->and($event['props']['provider'])->toBe('manual')
        ->and($event['props']['plan_id'])->not->toBeNull()
        ->and($event['props']['subscription_id'])->toBe($payment->subscription_id);
});

test('payment trail initiated → succeeded → refunded shares one payment_id and one subject key', function () {
    Http::fake([
        'https://app.platega.io/v2/transaction/process' => Http::response([
            'transactionId' => 'tx-trail-1', 'status' => 'PENDING', 'url' => 'https://pay.platega.io/?id=tx-trail-1',
        ]),
        'https://app.platega.io/transaction/tx-trail-1/cancel-supported' => Http::response(['supported' => true]),
        'https://app.platega.io/transaction/tx-trail-1/cancel' => Http::response(['transactionId' => 'tx-trail-1', 'accepted' => true]),
    ]);
    payAnalyticsFake();

    $site = actingAsSiteUser();
    payPlategaProject();
    $this->postJson('/api/v1/pay/subscriptions', ['plan_code' => 'pro'], $site)->assertCreated();

    $this->postJson('/webhooks/platega', ['id' => 'tx-trail-1', 'status' => 'CONFIRMED'], [
        'X-MerchantId' => 'merchant-1', 'X-Secret' => 'secret-1',
    ])->assertOk();

    $payment = Payment::acrossProjects()->firstOrFail();
    app(ProjectContext::class)->set('proj-1');
    app(RefundPaymentHandler::class)->handle(new RefundPaymentCommand($payment->fresh(), RefundDTO::from([])));
    app(ProjectContext::class)->clear();

    $trail = collect(payAnalyticsEvents())
        ->filter(fn (array $event): bool => in_array($event['name'], ['payment.initiated', 'payment.succeeded', 'payment.refunded'], true))
        ->values();

    expect($trail->pluck('name')->all())->toBe(['payment.initiated', 'payment.succeeded', 'payment.refunded'])
        ->and($trail->pluck('props.payment_id')->unique()->all())->toBe([$payment->id])
        ->and($trail->pluck('subject_key')->unique()->all())->toBe(['user:proj-1:7'])
        ->and($trail->pluck('project_id')->unique()->all())->toBe(['proj-1']);
});
