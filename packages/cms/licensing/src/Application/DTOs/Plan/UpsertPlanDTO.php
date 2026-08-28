<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\DTOs\Plan;

use Spatie\LaravelData\Data;
use Spatie\LaravelData\Optional;

/**
 * План лицензионной поставки. Цена периода — вся тройка или ничего:
 * инвариант обеспечивает FormRequest (`required_with`), handler пишет
 * тройку атомарно.
 */
final class UpsertPlanDTO extends Data
{
    public function __construct(
        public string $code,
        public string $name,
        public int|Optional|null $price_minor,
        public string|Optional|null $currency,
        public string|Optional|null $interval,
    ) {}
}
