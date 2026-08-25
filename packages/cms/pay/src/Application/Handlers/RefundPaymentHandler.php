<?php

declare(strict_types=1);

namespace Cms\Pay\Application\Handlers;

use Cms\Pay\Application\Commands\RefundPaymentCommand;
use Cms\Pay\Application\Exceptions\PaymentNotRefundable;
use Cms\Pay\Application\Exceptions\RefundExceedsRefundable;
use Cms\Pay\Domain\Enums\PaymentStatus;
use Cms\Pay\Domain\Events\PaymentRefunded;
use Cms\Pay\Domain\Models\Payment;
use Cms\Pay\Infrastructure\Gateways\ProviderRegistry;
use Cms\Shared\Values\Money;
use Illuminate\Contracts\Events\Dispatcher;
use Illuminate\Support\Facades\DB;
use Spatie\LaravelData\Optional;

/**
 * Возврат по платежу: проверка доменных инвариантов, вызов провайдера,
 * запись возврата. Проводка леджера и событие аналитики — синхронные
 * листенеры `PaymentRefunded` (И8).
 *
 * Вызов провайдера сознательно оставлен ВНЕ транзакции — это известный
 * дефект, зафиксированный списком 9.2; чинить его здесь запрещено, иначе
 * дифф рефакторинга перестанет быть проверяемым.
 */
final class RefundPaymentHandler
{
    public function __construct(
        private readonly ProviderRegistry $providers,
        private readonly Dispatcher $events,
    ) {}

    public function handle(RefundPaymentCommand $command): Payment
    {
        $payment = $command->payment;
        $refundable = $payment->refundable();
        // Отсутствующий amount_minor — полный возврат остатка, а не нулевой (И1).
        $amount = $command->data->amount_minor instanceof Optional
            ? $refundable
            : Money::of($command->data->amount_minor, $payment->currency);

        // Возврат меньше минорной единицы и возврат сверх остатка одинаково запрещены.
        if ($amount->amountMinor < 1 || $refundable->subtract($amount)->isNegative()) {
            throw RefundExceedsRefundable::make();
        }

        if (! in_array($payment->status, [PaymentStatus::Succeeded, PaymentStatus::RefundedPartial], true)) {
            throw PaymentNotRefundable::make();
        }

        $this->providers->for($payment->project_id, $payment->provider)->refund($payment, $amount);

        return DB::transaction(function () use ($payment, $amount) {
            $payment->refunded_minor += $amount->amountMinor;
            // Возвращено всё — RefundedFull; остаток положительный — RefundedPartial.
            $payment->status = $payment->refundable()->isNegative() || $payment->refundable()->isZero()
                ? PaymentStatus::RefundedFull
                : PaymentStatus::RefundedPartial;
            $payment->save();

            $this->events->dispatch(new PaymentRefunded($payment, $amount));

            return $payment;
        });
    }
}
