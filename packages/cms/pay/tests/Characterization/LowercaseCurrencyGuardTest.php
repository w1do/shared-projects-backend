<?php

declare(strict_types=1);

use Cms\Pay\Domain\Models\Payment;
use Cms\Pay\Domain\Models\PaymentTransaction;

/**
 * Guard задачи 7.5: валюта, записанная не в верхнем регистре, проходит весь
 * платёжный цикл как есть — так вела себя платформа до рефакторинга.
 * Строгий VO `Cms\Shared\Values\Currency` (только `^[A-Z]{3}$`) допустим
 * на границе провайдера и во внутренних вычислениях возврата (там он был
 * и в HEAD), но не на путях чтения плана/платежа из БД.
 */
test('guard: 7.5 lowercase currency plan survives subscribe and confirm', function () {
    $headers = actingAsPayOperator();
    $plan = makePlan(['code' => 'lower', 'name' => 'Lower', 'price_minor' => 5_000, 'currency' => 'usd']);

    $siteHeaders = actingAsSiteUser();

    $subscribe = $this->postJson('/api/v1/pay/subscriptions', ['plan_code' => $plan->code], $siteHeaders);

    $subscribe->assertCreated()
        ->assertJsonPath('data.payment.currency', 'usd')
        ->assertJsonPath('data.payment.amount_minor', 5_000);

    $paymentId = $subscribe->json('data.payment.id');

    actingAsPayOperator();
    $this->postJson("/api/admin/v1/projects/proj-1/pay/payments/{$paymentId}/confirm", [], $headers)
        ->assertOk()
        ->assertJsonPath('data.currency', 'usd');

    $payment = Payment::query()->findOrFail($paymentId);
    expect($payment->status->value)->toBe('succeeded');

    // Леджер принял валюту платежа как есть — включая некорректный регистр.
    $charge = PaymentTransaction::query()->where('payment_id', $paymentId)->firstOrFail();
    expect($charge->currency)->toBe('usd')
        ->and($charge->amount_minor)->toBe(5_000);
});
