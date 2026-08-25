<?php

declare(strict_types=1);

namespace Cms\Pay\Domain\Events;

use Cms\Pay\Domain\Enums\PaymentStatus;
use Cms\Pay\Domain\Models\Payment;

/**
 * Статус платежа сменился на $status. Событие поднимается на любом переходе
 * внутри той же транзакции, что и сам переход: листенеры синхронные,
 * `ShouldQueue`/`afterCommit` запрещены (Safety Protocol, И8).
 */
final readonly class PaymentStatusChanged
{
    public function __construct(
        public Payment $payment,
        public PaymentStatus $status,
    ) {}
}
