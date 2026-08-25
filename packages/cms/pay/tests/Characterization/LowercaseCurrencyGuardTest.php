<?php

declare(strict_types=1);

use Cms\Pay\Domain\Enums\TransactionType;
use Cms\Pay\Domain\Models\Payment;
use Cms\Pay\Domain\Models\PaymentTransaction;
use Cms\Pay\Domain\Models\Plan;

/**
 * Guard задачи 7.5, переписан change'ем fix-known-behavioral-defects (Д11).
 *
 * Было (дефект HEAD): валюта не в верхнем регистре проходила создание,
 * подписку и подтверждение «как есть» (в леджере оставался `usd`), а путь
 * возврата падал 500 на строгом VO `Currency`.
 *
 * Стало: валюта нормализуется к верхнему регистру на записи
 * (`UpsertPlanHandler`), исторические данные приведены миграцией бэкфилла,
 * и полный платёжный цикл — включая возврат — работает на строгом Money
 * (`Plan::price()` / `Payment::amount()`); леджер и ответы API отдают `USD`.
 */
test('guard: 7.5 lowercase currency plan is stored as USD and full cycle including refund works', function () {
    $headers = actingAsPayOperator();

    // План создаётся через admin API: нормализация — свойство записи, не валидации (201 остаётся 201)
    $created = $this->postJson('/api/admin/v1/projects/proj-1/pay/plans', [
        'code' => 'lower', 'name' => 'Lower', 'price_minor' => 5_000, 'currency' => 'usd',
    ], $headers);

    $created->assertCreated()->assertJsonPath('data.currency', 'USD');
    expect(Plan::acrossProjects()->where('code', 'lower')->sole()->currency)->toBe('USD');

    $siteHeaders = actingAsSiteUser();

    $subscribe = $this->postJson('/api/v1/pay/subscriptions', ['plan_code' => 'lower'], $siteHeaders);

    $subscribe->assertCreated()
        ->assertJsonPath('data.payment.currency', 'USD')
        ->assertJsonPath('data.payment.amount_minor', 5_000);

    $paymentId = $subscribe->json('data.payment.id');

    actingAsPayOperator();
    $this->postJson("/api/admin/v1/projects/proj-1/pay/payments/{$paymentId}/confirm", [], $headers)
        ->assertOk()
        ->assertJsonPath('data.currency', 'USD');

    $payment = Payment::query()->findOrFail($paymentId);
    expect($payment->status->value)->toBe('succeeded');

    // Леджер хранит нормализованную валюту платежа
    $charge = PaymentTransaction::query()->where('payment_id', $paymentId)
        ->where('type', TransactionType::Charge)->firstOrFail();
    expect($charge->currency)->toBe('USD')
        ->and($charge->amount_minor)->toBe(5_000);

    // Возврат больше не падает 500: строгий Money принимает USD из БД
    $this->postJson("/api/admin/v1/projects/proj-1/pay/payments/{$paymentId}/refund", [], $headers)
        ->assertOk()
        ->assertJsonPath('data.status', 'refunded_full')
        ->assertJsonPath('data.currency', 'USD');

    $refund = PaymentTransaction::query()->where('payment_id', $paymentId)
        ->where('type', TransactionType::Refund)->firstOrFail();
    expect($refund->currency)->toBe('USD')
        ->and($refund->amount_minor)->toBe(-5_000);
});
