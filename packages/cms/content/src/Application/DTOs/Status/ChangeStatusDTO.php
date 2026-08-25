<?php

declare(strict_types=1);

namespace Cms\Content\Application\DTOs\Content;

use Spatie\LaravelData\Data;
use Spatie\LaravelData\Optional;

final class ChangeStatusDTO extends Data
{
    public function __construct(
        public string $status,
        public string|Optional|null $scheduled_at,
    ) {}

    /** @return array<string, list<mixed>> */
    public static function rules(): array
    {
        return [
            'status' => ['required', 'in:draft,scheduled,published,archived'],
            'scheduled_at' => ['required_if:status,scheduled', 'nullable', 'date', 'after:now'],
        ];
    }
}
