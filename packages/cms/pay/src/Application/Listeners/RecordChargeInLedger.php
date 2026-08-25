<?php

declare(strict_types=1);

namespace Cms\Pay\Application\Listeners;

use Cms\Pay\Domain\Enums\TransactionType;
use Cms\Pay\Domain\Events\PaymentSucceeded;

/**
 * Приходная проводка append-only леджера. Синхронный листенер: выполняется
 * внутри транзакции `ApplyPaymentStatusHandler`, `ShouldQueue` запрещён (И8).
 */
final class RecordChargeInLedger
{
    public function handle(PaymentSucceeded $event): void
    {
        $payment = $event->payment;

        // Сырые поля платежа, не Money: леджер обязан принять ту же валюту,
        // что записана в платеже, включая некорректный регистр (Б-список).
        $payment->transactions()->create([
            'project_id' => $payment->project_id,
            'type' => TransactionType::Charge,
            'amount_minor' => $payment->amount_minor,
            'currency' => $payment->currency,
            'created_at' => now(),
        ]);
    }
}
