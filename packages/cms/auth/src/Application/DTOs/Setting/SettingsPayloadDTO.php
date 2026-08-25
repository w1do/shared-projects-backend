<?php

declare(strict_types=1);

namespace Cms\Auth\Application\DTOs\Setting;

use Spatie\LaravelData\Data;

final class SettingsPayloadDTO extends Data
{
    /** @param array<string, mixed> $values */
    public function __construct(public array $values) {}

    /** @return array<string, list<mixed>> */
    public static function rules(): array
    {
        return ['values' => ['required', 'array']];
    }
}
