<?php

declare(strict_types=1);

namespace Cms\Pay\Application\Commands;

use Cms\Pay\Domain\Enums\PaymentStatus;
use Cms\Pay\Domain\Models\Payment;

final readonly class ApplyPaymentStatusCommand
{
    public function __construct(
        public Payment $payment,
        public PaymentStatus $status,
    ) {}
}
