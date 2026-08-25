<?php

declare(strict_types=1);

namespace Cms\Pay\Application\Commands;

use Cms\Pay\Application\DTOs\Payment\RefundDTO;
use Cms\Pay\Domain\Models\Payment;

final readonly class RefundPaymentCommand
{
    public function __construct(
        public Payment $payment,
        public RefundDTO $data,
    ) {}
}
