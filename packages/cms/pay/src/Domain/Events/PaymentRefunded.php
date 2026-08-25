<?php

declare(strict_types=1);

namespace Cms\Pay\Domain\Events;

use Cms\Pay\Domain\Models\Payment;
use Cms\Shared\Values\Money;

/**
 * По платежу проведён возврат на сумму $amount. Поднимается внутри той же
 * транзакции, что и запись возврата; листенеры синхронные (И8).
 */
final readonly class PaymentRefunded
{
    public function __construct(
        public Payment $payment,
        public Money $amount,
    ) {}
}
