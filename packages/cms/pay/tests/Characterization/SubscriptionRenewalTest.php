<?php

declare(strict_types=1);

use Cms\Pay\Application\Handlers\ApplyPaymentStatusHandler;
use Cms\Pay\Application\Handlers\RenewSubscriptionHandler;
use Cms\Pay\Domain\Models\Payment;
use Cms\Pay\Domain\Models\Plan;
use Cms\Pay\Domain\Models\Subscription;
use Cms\Pay\Domain\Models\WebhookEvent;
use Cms\Pay\Infrastructure\Gateways\ProviderRegistry;
use Cms\Pay\Infrastructure\Jobs\ProcessWebhookEventJob;
use Cms\Pay\Infrastructure\Jobs\RenewDueSubscriptionsJob;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Support\Carbon;

/**
 * Задача 0.7 — характеризация цепочки продления подписки. До этих тестов
 * механизм не покрыт ничем: SubscriptionTest:75-88 проверяет только
 * идемпотентность создания платежа продления, но не сам сдвиг периода.
 *
 * Реальная цепочка (фиксируется как есть, не как «должно быть»):
 *   PayServiceProvider:26  — планировщик, RenewDueSubscriptionsJob ежечасно на очереди critical
 *   RenewDueSubscriptionsJob:28-41 — выборка due-подписок, ProjectContext на каждую
 *   RenewSubscriptionHandler:28-37 — платёж с ключом идемпотентности sub:{id}:renew:{Ymd периода}
 *   ApplyPaymentStatusHandler:64-85 (extendSubscription) — сдвиг периода при переходе в succeeded
 *
 * ВАЖНАЯ ХАРАКТЕРИСТИКА (расходится с формулировкой «сдвинут ровно на интервал плана»):
 * ApplyPaymentStatusHandler:76-78 берёт базой НЕ прежний конец периода, а now(),
 * когда прежний период уже истёк (`isFuture() ? current_period_ends_at : now()`).
 * Для просроченной подписки новый период = now() + interval, то есть просрочка
 * НЕ компенсируется: «ровно на интервал плана» верно только относительно now().
 *
 * Все фикстуры — с явными значениями, время фиксируется Carbon::setTestNow.
 */
function payRenewalPlan(array $attrs = []): Plan
{
    return makePlan(array_merge([
        'code' => 'pro',
        'name' => 'Pro',
        'price_minor' => 1000,
        'currency' => 'RUB',
        'interval' => 'month',
    ], $attrs));
}

function payRenewalSubscription(Plan $plan, string $endsAt, int $attempts = 0): Subscription
{
    app(ProjectContext::class)->set('proj-1');

    $subscription = Subscription::create([
        'user_key' => 'user:proj-1:7',
        'plan_id' => $plan->id,
        'status' => 'active',
        'current_period_ends_at' => $endsAt,
    ]);

    $subscription->forceFill(['renewal_attempts' => $attempts])->save();

    return $subscription;
}

/** Продление ровно так, как его запускает планировщик. Джоба чистит контекст в finally. */
function payRunDueRenewals(): void
{
    (new RenewDueSubscriptionsJob)->handle(app(RenewSubscriptionHandler::class), app(ProjectContext::class));

    app(ProjectContext::class)->set('proj-1');
}

function payRenewalPaymentOf(Subscription $subscription): Payment
{
    app(ProjectContext::class)->set('proj-1');

    return Payment::query()->where('subscription_id', $subscription->id)->sole();
}

function payConfirmUrl(Payment $payment): string
{
    return "/api/admin/v1/projects/proj-1/pay/payments/{$payment->id}/confirm";
}

// ------------------------------------------------------- (a) сдвиг периода

test('guard: 0.7 due subscription renewal creates payment and confirm shifts the period', function () {
    Carbon::setTestNow('2026-03-10 12:00:00');
    $headers = actingAsPayOperator();

    $plan = payRenewalPlan(['interval' => 'month', 'price_minor' => 1000]);
    // период истёк 9 дней назад, две неудачные попытки уже были
    $subscription = payRenewalSubscription($plan, '2026-03-01 00:00:00', attempts: 2);

    payRunDueRenewals();

    $payment = payRenewalPaymentOf($subscription);
    expect($payment->amount_minor)->toBe(1000)
        ->and($payment->currency)->toBe('RUB')
        ->and($payment->status->value)->toBe('pending')
        // RenewSubscriptionHandler не передаёт provider — CreatePaymentHandler:31 даёт 'manual'
        ->and($payment->provider)->toBe('manual')
        ->and($payment->description)->toBe('Renewal pro')
        ->and($payment->idempotency_key)->toBe("sub:{$subscription->id}:renew:20260301");

    // до подтверждения платежа период не двигается
    expect($subscription->fresh()->current_period_ends_at->toDateTimeString())->toBe('2026-03-01 00:00:00')
        ->and($subscription->fresh()->renewal_attempts)->toBe(2);

    $this->postJson(payConfirmUrl($payment), [], $headers)
        ->assertOk()
        ->assertJsonPath('data.status', 'succeeded');

    $fresh = $subscription->fresh();
    expect($fresh->current_period_ends_at->toDateTimeString())->toBe('2026-04-10 12:00:00')
        // не '2026-04-01 00:00:00': база — now(), а не прежний конец периода (см. докблок файла)
        ->and($fresh->current_period_ends_at->toDateTimeString())->not->toBe('2026-04-01 00:00:00')
        ->and($fresh->status->value)->toBe('active')
        ->and($fresh->renewal_attempts)->toBe(0);

    $this->assertDatabaseHas('subscriptions', [
        'id' => $subscription->id,
        'status' => 'active',
        'renewal_attempts' => 0,
        'current_period_ends_at' => '2026-04-10 12:00:00',
    ]);

    // леджер: ровно одна charge-проводка на сумму плана
    expect($payment->fresh()->transactions()->count())->toBe(1)
        ->and((int) $payment->fresh()->transactions()->sum('amount_minor'))->toBe(1000);
});

test('guard: 0.7 renewal interval comes from the plan', function () {
    Carbon::setTestNow('2026-03-10 12:00:00');
    $headers = actingAsPayOperator();

    $plan = payRenewalPlan(['code' => 'annual', 'name' => 'Annual', 'price_minor' => 120000, 'interval' => 'year']);
    $subscription = payRenewalSubscription($plan, '2026-02-28 00:00:00');

    payRunDueRenewals();
    $payment = payRenewalPaymentOf($subscription);

    expect($payment->amount_minor)->toBe(120000)
        ->and($payment->idempotency_key)->toBe("sub:{$subscription->id}:renew:20260228");

    $this->postJson(payConfirmUrl($payment), [], $headers)->assertOk();

    expect($subscription->fresh()->current_period_ends_at->toDateTimeString())->toBe('2027-03-10 12:00:00');
});

// ------------------------------------- (b) гвард идемпотентности повторного confirm

test('guard: 0.7 repeated confirm does not shift the period a second time', function () {
    Carbon::setTestNow('2026-03-10 12:00:00');
    $headers = actingAsPayOperator();

    $plan = payRenewalPlan(['interval' => 'month', 'price_minor' => 1000]);
    $subscription = payRenewalSubscription($plan, '2026-03-01 00:00:00', attempts: 2);

    payRunDueRenewals();
    $payment = payRenewalPaymentOf($subscription);

    $this->postJson(payConfirmUrl($payment), [], $headers)->assertOk();
    expect($subscription->fresh()->current_period_ends_at->toDateTimeString())->toBe('2026-04-10 12:00:00');

    // часы идут дальше; без гварда ApplyPaymentStatusHandler:25-27 второй confirm
    // взял бы базой уже будущий 2026-04-10 и сдвинул период до 2026-05-10
    Carbon::setTestNow('2026-03-20 09:00:00');

    $this->postJson(payConfirmUrl($payment), [], $headers)
        ->assertOk()
        ->assertJsonPath('data.status', 'succeeded');

    $fresh = $subscription->fresh();
    expect($fresh->current_period_ends_at->toDateTimeString())->toBe('2026-04-10 12:00:00')
        ->and($fresh->status->value)->toBe('active')
        ->and($fresh->renewal_attempts)->toBe(0);

    $this->assertDatabaseHas('subscriptions', [
        'id' => $subscription->id,
        'current_period_ends_at' => '2026-04-10 12:00:00',
    ]);

    // и второй проводки в леджере тоже нет
    expect($payment->fresh()->transactions()->count())->toBe(1)
        ->and(Payment::query()->count())->toBe(1);
});

// ------------------------------------------------ (c) та же цепочка через вебхук

test('guard: 0.7 webhook succeeded payload renews the subscription', function () {
    Carbon::setTestNow('2026-03-10 12:00:00');
    actingAsPayOperator();

    $plan = payRenewalPlan(['interval' => 'month', 'price_minor' => 1000]);
    $subscription = payRenewalSubscription($plan, '2026-03-01 00:00:00', attempts: 3);

    payRunDueRenewals();
    $payment = payRenewalPaymentOf($subscription);

    $event = WebhookEvent::create([
        'provider' => 'null',
        'external_id' => 'evt-renew-1',
        'payload' => ['id' => 'evt-renew-1', 'status' => 'succeeded', 'payment_id' => $payment->id],
    ]);

    // джоба сама ставит и чистит ProjectContext (ProcessWebhookEventJob:64,68)
    (new ProcessWebhookEventJob($event->id))
        ->handle(app(ProviderRegistry::class), app(ApplyPaymentStatusHandler::class));

    app(ProjectContext::class)->set('proj-1');

    $fresh = $subscription->fresh();
    expect($fresh->current_period_ends_at->toDateTimeString())->toBe('2026-04-10 12:00:00')
        ->and($fresh->status->value)->toBe('active')
        ->and($fresh->renewal_attempts)->toBe(0)
        ->and($payment->fresh()->status->value)->toBe('succeeded')
        ->and($payment->fresh()->transactions()->count())->toBe(1)
        ->and($event->fresh()->status)->toBe('processed');

    $this->assertDatabaseHas('subscriptions', [
        'id' => $subscription->id,
        'status' => 'active',
        'renewal_attempts' => 0,
        'current_period_ends_at' => '2026-04-10 12:00:00',
    ]);
});

test('guard: 0.7 second webhook for the same payment does not shift the period again', function () {
    Carbon::setTestNow('2026-03-10 12:00:00');
    actingAsPayOperator();

    $plan = payRenewalPlan(['interval' => 'month', 'price_minor' => 1000]);
    $subscription = payRenewalSubscription($plan, '2026-03-01 00:00:00');

    payRunDueRenewals();
    $payment = payRenewalPaymentOf($subscription);

    $payload = ['status' => 'succeeded', 'payment_id' => $payment->id];
    $first = WebhookEvent::create([
        'provider' => 'null', 'external_id' => 'evt-renew-1',
        'payload' => $payload + ['id' => 'evt-renew-1'],
    ]);
    (new ProcessWebhookEventJob($first->id))
        ->handle(app(ProviderRegistry::class), app(ApplyPaymentStatusHandler::class));

    app(ProjectContext::class)->set('proj-1');
    expect($subscription->fresh()->current_period_ends_at->toDateTimeString())->toBe('2026-04-10 12:00:00');

    // провайдер прислал повтор новым событием — сработать обязан гвард в handler,
    // а не «уже processed» в самой джобе
    Carbon::setTestNow('2026-03-20 09:00:00');
    $second = WebhookEvent::create([
        'provider' => 'null', 'external_id' => 'evt-renew-2',
        'payload' => $payload + ['id' => 'evt-renew-2'],
    ]);
    (new ProcessWebhookEventJob($second->id))
        ->handle(app(ProviderRegistry::class), app(ApplyPaymentStatusHandler::class));

    app(ProjectContext::class)->set('proj-1');
    $fresh = $subscription->fresh();
    expect($fresh->current_period_ends_at->toDateTimeString())->toBe('2026-04-10 12:00:00')
        ->and($fresh->status->value)->toBe('active')
        ->and($payment->fresh()->transactions()->count())->toBe(1)
        ->and($second->fresh()->status)->toBe('processed');
});

test('guard: 0.7 webhook endpoint runs the whole renewal chain', function () {
    Carbon::setTestNow('2026-03-10 12:00:00');
    actingAsPayOperator();

    $plan = payRenewalPlan(['interval' => 'month', 'price_minor' => 1000]);
    $subscription = payRenewalSubscription($plan, '2026-03-01 00:00:00', attempts: 1);

    payRunDueRenewals();
    $payment = payRenewalPaymentOf($subscription);

    // QUEUE_CONNECTION=sync: ProcessWebhookEventJob выполняется прямо в запросе
    $this->postJson('/webhooks/null', [
        'id' => 'evt-renew-http', 'status' => 'succeeded', 'payment_id' => $payment->id,
    ], ['X-Null-Signature' => 'valid-signature'])->assertOk();

    app(ProjectContext::class)->set('proj-1');
    $fresh = $subscription->fresh();
    expect($fresh->current_period_ends_at->toDateTimeString())->toBe('2026-04-10 12:00:00')
        ->and($fresh->status->value)->toBe('active')
        ->and($fresh->renewal_attempts)->toBe(0)
        ->and($payment->fresh()->status->value)->toBe('succeeded');

    $this->assertDatabaseHas('payment_webhook_events', [
        'provider' => 'null',
        'external_id' => 'evt-renew-http',
        'status' => 'processed',
    ]);
});

// -------------------------------------- смежные характеристики механизма продления

test('guard: 0.7 due job skips subscriptions that exhausted renewal attempts', function () {
    Carbon::setTestNow('2026-03-10 12:00:00');
    actingAsPayOperator();

    $plan = payRenewalPlan(['interval' => 'month', 'price_minor' => 1000]);
    // RenewDueSubscriptionsJob:31 — where('renewal_attempts', '<', 5)
    $exhausted = payRenewalSubscription($plan, '2026-03-01 00:00:00', attempts: 5);

    payRunDueRenewals();

    expect(Payment::query()->count())->toBe(0)
        ->and($exhausted->fresh()->current_period_ends_at->toDateTimeString())->toBe('2026-03-01 00:00:00');
});

test('guard: 0.7 due job leaves subscriptions with a live period untouched', function () {
    Carbon::setTestNow('2026-03-10 12:00:00');
    actingAsPayOperator();

    $plan = payRenewalPlan(['interval' => 'month', 'price_minor' => 1000]);
    $live = payRenewalSubscription($plan, '2026-04-01 00:00:00');

    payRunDueRenewals();

    expect(Payment::query()->count())->toBe(0)
        ->and($live->fresh()->current_period_ends_at->toDateTimeString())->toBe('2026-04-01 00:00:00');
});
