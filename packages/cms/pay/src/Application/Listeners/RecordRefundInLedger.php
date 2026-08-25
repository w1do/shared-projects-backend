<?php

declare(strict_types=1);

namespace Cms\Pay\Application\Listeners;

use Cms\Pay\Domain\Enums\TransactionType;
use Cms\Pay\Domain\Events\PaymentRefunded;

/** Расходная проводка возврата: сумма записывается со знаком минус. */
final class RecordRefundInLedger
{
    public function handle(PaymentRefunded $event): void
    {
        $payment = $event->payment;

        $payment->transactions()->create([
            'project_id' => $payment->project_id,
            'type' => TransactionType::Refund,
            'amount_minor' => -$event->amount->amountMinor,
            'currency' => $event->amount->currency->code,
            'created_at' => now(),
        ]);
    }
}
