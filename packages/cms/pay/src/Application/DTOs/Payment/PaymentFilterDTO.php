<?php

declare(strict_types=1);

namespace Cms\Pay\Application\DTOs\Payment;

use Cms\Pay\Domain\Enums\PaymentStatus;
use Spatie\LaravelData\Data;

/** Отбор платежей: статус и размер страницы. */
final class PaymentFilterDTO extends Data
{
    public function __construct(
        public ?PaymentStatus $status = null,
        public int $per_page = 50,
    ) {}
}
