<?php

declare(strict_types=1);

namespace Cms\Pay\Application\Listeners;

use Cms\Pay\Domain\Enums\PaymentStatus;
use Cms\Pay\Domain\Events\PaymentStatusChanged;
use Cms\Shared\Analytics\Analytics;

/**
 * Событие платежа в историю пользователя. Остаётся синхронным: воркеры
 * pay подняты, но доставка уже уходит в очередь внутри `Analytics::push`,
 * а порядок эффектов в транзакции менять нельзя (И8/И9).
 */
final class PushPaymentStatusEvent
{
    public function handle(PaymentStatusChanged $event): void
    {
        $payment = $event->payment;
        $status = $event->status;

        // Сырые поля платежа, не Money: в аналитику уходит валюта как есть,
        // строгий VO отверг бы значения не в верхнем регистре (Б-список).
        Analytics::push($payment->user_key, [
            'name' => $status === PaymentStatus::Succeeded ? 'payment.succeeded' : "payment.{$status->value}",
            'value_minor' => $status === PaymentStatus::Succeeded ? $payment->amount_minor : 0,
            'currency' => $payment->currency,
            'props' => ['payment_id' => $payment->id],
        ], $payment->project_id);
    }
}
