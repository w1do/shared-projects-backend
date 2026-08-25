<?php

declare(strict_types=1);

namespace Cms\Pay\Application\Handlers;

use Cms\Pay\Application\Commands\ApplyPaymentStatusCommand;
use Cms\Pay\Application\Exceptions\PaymentTransitionNotAllowed;
use Cms\Pay\Domain\Enums\PaymentStatus;
use Cms\Pay\Domain\Events\PaymentStatusChanged;
use Cms\Pay\Domain\Events\PaymentSucceeded;
use Cms\Pay\Domain\Models\Payment;
use Illuminate\Contracts\Events\Dispatcher;
use Illuminate\Support\Facades\DB;

/**
 * Единственная точка смены статуса платежа. Побочные эффекты (леджер,
 * продление подписки, аналитика) вынесены в синхронные листенеры доменных
 * событий; сам handler отвечает только за гвард идемпотентности, проверку
 * перехода и запись статуса.
 *
 * Границу транзакции двигать нельзя (И8): гвард идемпотентности стоит ДО
 * транзакции, все эффекты — внутри одной транзакции и в прежнем порядке
 * (леджер → продление подписки → аналитика).
 */
final class ApplyPaymentStatusHandler
{
    public function __construct(private readonly Dispatcher $events) {}

    public function handle(ApplyPaymentStatusCommand $command): Payment
    {
        $payment = $command->payment;
        $target = $command->status;

        if ($payment->status === $target) {
            return $payment; // идемпотентность: повторный вебхук без эффекта
        }

        if (! $payment->status->canTransitionTo($target)) {
            throw PaymentTransitionNotAllowed::between($payment->status, $target);
        }

        return DB::transaction(function () use ($payment, $target) {
            $payment->status = $target;
            $payment->save();

            if ($target === PaymentStatus::Succeeded) {
                $this->events->dispatch(new PaymentSucceeded($payment));
            }

            $this->events->dispatch(new PaymentStatusChanged($payment, $target));

            return $payment;
        });
    }
}
