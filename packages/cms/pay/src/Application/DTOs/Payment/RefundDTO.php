<?php

declare(strict_types=1);

namespace Cms\Pay\Application\DTOs\Payment;

use Spatie\LaravelData\Data;
use Spatie\LaravelData\Optional;

final class RefundDTO extends Data
{
    public function __construct(
        public int|Optional $amount_minor, // без значения — полный возврат
    ) {}
}
