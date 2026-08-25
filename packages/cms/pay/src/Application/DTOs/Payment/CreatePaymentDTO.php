<?php

declare(strict_types=1);

namespace Cms\Pay\Application\DTOs\Payment;

use Spatie\LaravelData\Data;
use Spatie\LaravelData\Optional;

final class CreatePaymentDTO extends Data
{
    public function __construct(
        public int $amount_minor,
        public string $currency,
        public string|Optional|null $description,
        public string|Optional $provider,
    ) {}

    /** @return array<string, list<mixed>> */
    public static function rules(): array
    {
        return [
            'amount_minor' => ['required', 'integer', 'min:1'],
            'currency' => ['required', 'string', 'size:3'],
            'description' => ['sometimes', 'nullable', 'string', 'max:255'],
            'provider' => ['sometimes', 'string', 'max:32'],
        ];
    }
}
