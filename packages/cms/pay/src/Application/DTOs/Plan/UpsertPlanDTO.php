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

    /** @return array<string, list<mixed>> */
    public static function rules(): array
    {
        return [
            'code' => ['required', 'string', 'max:64', 'alpha_dash'],
            'name' => ['required', 'string', 'max:255'],
            'price_minor' => ['required', 'integer', 'min:0'],
            'currency' => ['sometimes', 'string', 'size:3'],
            'interval' => ['sometimes', 'in:day,month,year'],
            'options' => ['sometimes', 'array'],
            'features' => ['sometimes', 'array'],
            'features.*' => ['string', 'max:64'],
        ];
    }
}
