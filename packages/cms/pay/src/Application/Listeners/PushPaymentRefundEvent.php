<?php

declare(strict_types=1);

namespace Cms\Pay\Application\Listeners;

use Cms\Pay\Domain\Events\PaymentRefunded;
use Cms\Shared\Analytics\Analytics;

/** Событие возврата в историю пользователя: сумма со знаком минус. */
final class PushPaymentRefundEvent
{
    public function handle(PaymentRefunded $event): void
    {
        $payment = $event->payment;

        Analytics::push($payment->user_key, [
            'name' => 'payment.refunded',
            'value_minor' => -$event->amount->amountMinor,
            'currency' => $event->amount->currency->code,
            'props' => PaymentAnalyticsProps::for($payment),
        ], $payment->project_id);
    }
}
