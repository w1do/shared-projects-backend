<?php

declare(strict_types=1);

namespace Cms\Auth\Application\DTOs\Project;

use Spatie\LaravelData\Data;
use Spatie\LaravelData\Optional;

final class UpdateProjectDTO extends Data
{
    /** @param list<string>|Optional $locales */
    public function __construct(
        public string|Optional $name,
        public array|Optional $locales,
    ) {}

    /** @return array<string, list<mixed>> */
    public static function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'locales' => ['sometimes', 'array', 'min:1'],
            'locales.*' => ['string', 'max:10'],
        ];
    }
}
