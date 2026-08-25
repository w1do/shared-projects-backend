<?php

declare(strict_types=1);

use Cms\Pay\Application\Commands\ApplyPaymentStatusCommand;
use Cms\Pay\Application\Commands\CreatePaymentCommand;
use Cms\Pay\Application\DTOs\Payment\CreatePaymentDTO;
use Cms\Pay\Application\Handlers\ApplyPaymentStatusHandler;
use Cms\Pay\Application\Handlers\CreatePaymentHandler;
use Cms\Pay\Domain\Enums\PaymentStatus;
use Cms\Pay\Domain\Models\Payment;
use Cms\Pay\Domain\Models\WebhookEvent;
use Cms\Pay\Infrastructure\Gateways\ProviderRegistry;
use Cms\Pay\Infrastructure\Jobs\ProcessWebhookEventJob;
use Cms\Shared\Analytics\AnalyticsRecorder;
use Cms\Shared\Jobs\SendAnalyticsEventJob;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Queue;

function nullPayment(): Payment
{
    app(ProjectContext::class)->set('proj-1');

    return app(CreatePaymentHandler::class)->handle(new CreatePaymentCommand(
        userKey: 'user:proj-1:7',
        data: CreatePaymentDTO::from(['amount_minor' => 100, 'currency' => 'RUB', 'provider' => 'null']),
    ));
}

test('webhook with invalid signature gets 401 and stores nothing', function () {
    $this->postJson('/webhooks/null', ['id' => 'evt-1'], ['X-Null-Signature' => 'wrong'])
        ->assertStatus(401);

    expect(WebhookEvent::query()->count())->toBe(0);
});

test('valid webhook is stored once and dispatched to the webhooks queue; duplicate gets 200 without effect', function () {
    Queue::fake([ProcessWebhookEventJob::class]);
    $payment = nullPayment();
    $payload = ['id' => 'evt-42', 'status' => 'succeeded', 'payment_id' => $payment->id];

    $this->postJson('/webhooks/null', $payload, ['X-Null-Signature' => 'valid-signature'])->assertOk();
    $this->postJson('/webhooks/null', $payload, ['X-Null-Signature' => 'valid-signature'])->assertOk();

    expect(WebhookEvent::query()->count())->toBe(1);
    Queue::assertPushedOn('webhooks', ProcessWebhookEventJob::class);
    Queue::assertPushed(ProcessWebhookEventJob::class, 1);
});

test('webhook processing applies the payment status idempotently', function () {
    $payment = nullPayment();
    $event = WebhookEvent::create([
        'provider' => 'null', 'external_id' => 'evt-7',
        'payload' => ['id' => 'evt-7', 'status' => 'succeeded', 'payment_id' => $payment->id],
    ]);

    $job = new ProcessWebhookEventJob($event->id);
    $job->handle(app(ProviderRegistry::class), app(ApplyPaymentStatusHandler::class));
    $job->handle(app(ProviderRegistry::class), app(ApplyPaymentStatusHandler::class));

    app(ProjectContext::class)->set('proj-1');
    $fresh = $payment->fresh();
    expect($fresh->status->value)->toBe('succeeded')
        ->and($fresh->transactions()->count())->toBe(1)
        ->and($event->fresh()->status)->toBe('processed');
});

test('unknown provider webhook is 404', function () {
    $this->postJson('/webhooks/stripe', [])->assertNotFound();
});

test('pay events reach analytics', function () {
    config(['cms.analytics_url' => 'http://analytics-service:8000']);
    app()->forgetInstance(AnalyticsRecorder::class);
    Bus::fake([SendAnalyticsEventJob::class]);

    $payment = nullPayment();
    app(ApplyPaymentStatusHandler::class)->handle(
        new ApplyPaymentStatusCommand($payment, PaymentStatus::Succeeded),
    );

    Bus::assertDispatched(SendAnalyticsEventJob::class,
        fn ($job) => $job->event['name'] === 'payment.succeeded' && $job->event['value_minor'] === 100);
});
