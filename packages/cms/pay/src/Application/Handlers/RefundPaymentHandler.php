<?php

declare(strict_types=1);

namespace Cms\Pay\Application\Handlers;

use Cms\Pay\Application\Commands\RefundPaymentCommand;
use Cms\Pay\Domain\Enums\PaymentStatus;
use Cms\Pay\Domain\Enums\TransactionType;
use Cms\Pay\Domain\Models\Payment;
use Cms\Pay\Infrastructure\Providers\ProviderRegistry;
use Cms\Shared\Analytics\Analytics;
use Cms\Shared\Values\Money;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Spatie\LaravelData\Optional;

final class RefundPaymentHandler
{
    public function __construct(private readonly ProviderRegistry $providers) {}

    public function handle(RefundPaymentCommand $command): Payment
    {
        $payment = $command->payment;
        $amount = $command->data->amount_minor instanceof Optional
            ? $payment->refundableMinor()
            : $command->data->amount_minor;

        if ($amount < 1 || $amount > $payment->refundableMinor()) {
            throw ValidationException::withMessages(['amount_minor' => ['Refund exceeds the refundable amount.']]);
        }

        if (! in_array($payment->status, [PaymentStatus::Succeeded, PaymentStatus::RefundedPartial], true)) {
            throw ValidationException::withMessages(['status' => ['Only succeeded payments can be refunded.']]);
        }

        $this->providers->for($payment->project_id, $payment->provider)
            ->refund($payment, Money::of($amount, $payment->currency));

        return DB::transaction(function () use ($payment, $amount) {
            $payment->refunded_minor += $amount;
            $payment->status = $payment->refunded_minor >= $payment->amount_minor
                ? PaymentStatus::RefundedFull
                : PaymentStatus::RefundedPartial;
            $payment->save();

            $payment->transactions()->create([
                'project_id' => $payment->project_id,
                'type' => TransactionType::Refund,
                'amount_minor' => -$amount,
                'currency' => $payment->currency,
                'created_at' => now(),
            ]);

            Analytics::push($payment->user_key, [
                'name' => 'payment.refunded',
                'value_minor' => -$amount,
                'currency' => $payment->currency,
                'props' => ['payment_id' => $payment->id],
            ], $payment->project_id);

            return $payment;
        });
    }
}
