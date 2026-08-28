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
        $amount = $payment->amount();

        // Неуспех обогащается кодом ошибки провайдера из last_error (Д8)
        $failed = in_array($status, [PaymentStatus::Failed, PaymentStatus::Canceled], true);

        Analytics::push($payment->user_key, [
            'name' => $status === PaymentStatus::Succeeded ? 'payment.succeeded' : "payment.{$status->value}",
            'value_minor' => $status === PaymentStatus::Succeeded ? $amount->amountMinor : 0,
            'currency' => $amount->currency->code,
            'props' => PaymentAnalyticsProps::for($payment, withError: $failed),
        ], $payment->project_id);
    }
}
