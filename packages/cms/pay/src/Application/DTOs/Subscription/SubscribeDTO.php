<?php

declare(strict_types=1);

namespace Cms\Pay\Application\DTOs\Subscription;

use Spatie\LaravelData\Data;

final class SubscribeDTO extends Data
{
    public function __construct(public string $plan_code) {}

    /** @return array<string, list<mixed>> */
    public static function rules(): array
    {
        return ['plan_code' => ['required', 'string', 'max:64']];
    }
}
