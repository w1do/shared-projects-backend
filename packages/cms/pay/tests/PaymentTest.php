<?php

declare(strict_types=1);

use Cms\Pay\Application\Commands\ApplyPaymentStatusCommand;
use Cms\Pay\Application\Commands\CreatePaymentCommand;
use Cms\Pay\Application\DTOs\Payment\CreatePaymentDTO;
use Cms\Pay\Application\Handlers\ApplyPaymentStatusHandler;
use Cms\Pay\Application\Handlers\CreatePaymentHandler;
use Cms\Pay\Domain\Enums\PaymentStatus;
use Cms\Pay\Domain\Models\Payment;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Validation\ValidationException;

function createPayment(?string $idem = null): Payment
{
    app(ProjectContext::class)->set('proj-1');
    paySelectProvider('manual');

    return app(CreatePaymentHandler::class)->handle(new CreatePaymentCommand(
        subjectKey: 'user:proj-1:7',
        data: CreatePaymentDTO::from(['amount_minor' => 5000, 'currency' => 'RUB']),
        idempotencyKey: $idem,
    ));
}

test('payment creation is idempotent by key', function () {
    actingAsPayOperator();
    $a = createPayment('idem-1');
    $b = createPayment('idem-1');

    expect($a->id)->toBe($b->id)
        ->and(Payment::query()->count())->toBe(1);
});

test('manual payment goes pending and operator confirmation succeeds it with a ledger entry', function () {
    $headers = actingAsPayOperator();
    $payment = createPayment();

    expect($payment->status)->toBe(PaymentStatus::Pending);

    $this->postJson("/api/admin/v1/projects/proj-1/pay/payments/{$payment->id}/confirm", [], $headers)
        ->assertOk()->assertJsonPath('data.status', 'succeeded');

    $ledger = $payment->fresh()->transactions;
    expect($ledger)->toHaveCount(1)
        ->and($ledger[0]->amount_minor)->toBe(5000);
});

test('status machine rejects invalid transitions', function () {
    actingAsPayOperator();
    $payment = createPayment();
    $apply = app(ApplyPaymentStatusHandler::class);

    $apply->handle(new ApplyPaymentStatusCommand($payment, PaymentStatus::Succeeded));

    // succeeded → pending запрещён
    $apply->handle(new ApplyPaymentStatusCommand($payment->fresh(), PaymentStatus::Pending));
})->throws(ValidationException::class);

test('repeated status application is a no-op (idempotent webhooks)', function () {
    actingAsPayOperator();
    $payment = createPayment();
    $apply = app(ApplyPaymentStatusHandler::class);

    $apply->handle(new ApplyPaymentStatusCommand($payment, PaymentStatus::Succeeded));
    $apply->handle(new ApplyPaymentStatusCommand($payment->fresh(), PaymentStatus::Succeeded));

    expect($payment->fresh()->transactions()->count())->toBe(1);
});

test('partial and full refunds update the ledger and status', function () {
    $headers = actingAsPayOperator();
    $payment = createPayment();
    app(ApplyPaymentStatusHandler::class)->handle(new ApplyPaymentStatusCommand($payment, PaymentStatus::Succeeded));

    $this->postJson("/api/admin/v1/projects/proj-1/pay/payments/{$payment->id}/refund", ['amount_minor' => 2000], $headers)
        ->assertOk()->assertJsonPath('data.status', 'refunded_partial');

    $this->postJson("/api/admin/v1/projects/proj-1/pay/payments/{$payment->id}/refund", [], $headers)
        ->assertOk()->assertJsonPath('data.status', 'refunded_full');

    $fresh = $payment->fresh();
    expect($fresh->refunded_minor)->toBe(5000)
        ->and($fresh->transactions()->count())->toBe(3) // charge + 2 refund
        ->and((int) $fresh->transactions()->sum('amount_minor'))->toBe(0);

    // возврат сверх остатка невозможен
    $this->postJson("/api/admin/v1/projects/proj-1/pay/payments/{$payment->id}/refund", ['amount_minor' => 1], $headers)
        ->assertStatus(422);
});

test('operator without refund permission gets 403', function () {
    $headers = actingAsPayOperator(permissions: ['pay.payments.view']);
    $payment = createPayment();

    $this->postJson("/api/admin/v1/projects/proj-1/pay/payments/{$payment->id}/refund", [], $headers)
        ->assertStatus(403);
});

test('ledger is append-only', function () {
    actingAsPayOperator();
    $payment = createPayment();
    app(ApplyPaymentStatusHandler::class)->handle(new ApplyPaymentStatusCommand($payment, PaymentStatus::Succeeded));

    $payment->fresh()->transactions()->first()->update(['amount_minor' => 1]);
})->throws(LogicException::class);
