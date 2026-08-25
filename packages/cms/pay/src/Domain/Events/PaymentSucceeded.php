<?php

declare(strict_types=1);

namespace Cms\Pay\Domain\Events;

use Cms\Pay\Domain\Models\Payment;

/**
 * Платёж успешно проведён. Поднимается ПОСЛЕ сохранения статуса и ДО
 * общего `PaymentStatusChanged`: порядок эффектов (леджер → продление
 * подписки → аналитика) остаётся прежним (Safety Protocol, И8).
 */
final readonly class PaymentSucceeded
{
    public function __construct(public Payment $payment) {}
}
