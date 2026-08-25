<?php

declare(strict_types=1);

namespace Cms\Pay\Application\DTOs\Plan;

use Spatie\LaravelData\Data;
use Spatie\LaravelData\Optional;

final class UpsertPlanDTO extends Data
{
    /**
     * @param  array<string, string>|Optional  $options
     * @param  list<string>|Optional  $features  коды возможностей
     */
    public function __construct(
        public string $code,
        public string $name,
        public int $price_minor,
        public string|Optional $currency,
        public string|Optional $interval,
        public array|Optional $options,
        public array|Optional $features,
    ) {}
}
