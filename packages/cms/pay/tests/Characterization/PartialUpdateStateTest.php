<?php

declare(strict_types=1);

use Cms\Pay\Domain\Models\Payment;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Support\Facades\DB;

/**
 * Характеризационный тест возврата без суммы (задача 0.4, инвариант И1:
 * отсутствующий amount_minor означает ПОЛНЫЙ возврат, а не нулевой/частичный).
 *
 * Проверяет СОСТОЯНИЕ БД: подмена Optional на null в RefundDTO даёт 422
 * либо частичный возврат, и оба исхода снимок ответа фиксирует как «валидный».
 */
function guard04SucceededPayment(): Payment
{
    app(ProjectContext::class)->set('proj-1');

    return Payment::create([
        'subject_key' => 'user:proj-1:7',
        'amount_minor' => 10000,
        'currency' => 'RUB',
        'status' => 'succeeded',
        'provider' => 'manual',
        'provider_ref' => 'manual-ref-guard-04',
        'description' => 'Invoice guard 0.4',
    ]);
}

test('guard: 0.4 refund without amount refunds the full payment', function () {
    $headers = actingAsPayOperator();
    $payment = guard04SucceededPayment();

    expect((int) DB::table('payments')->where('id', $payment->id)->value('refunded_minor'))->toBe(0);

    // пустое тело: ключ amount_minor отсутствует, а не равен null
    $this->postJson("/api/admin/v1/projects/proj-1/pay/payments/{$payment->id}/refund", [], $headers)
        ->assertOk();

    $row = (array) DB::table('payments')->where('id', $payment->id)->first();

    expect((int) $row['refunded_minor'])->toBe(10000)   // возврат на полную сумму
        ->and((int) $row['amount_minor'])->toBe(10000)
        ->and($row['status'])->toBe('refunded_full')
        ->and($row['currency'])->toBe('RUB');

    // ledger: одна расходная проводка ровно на всю сумму
    $ledger = DB::table('payment_transactions')->where('payment_id', $payment->id)->get();
    expect($ledger)->toHaveCount(1)
        ->and((int) $ledger[0]->amount_minor)->toBe(-10000)
        ->and($ledger[0]->type)->toBe('refund');
});
