<?php

declare(strict_types=1);

namespace Cms\Auth\Application\DTOs\Project;

use Spatie\LaravelData\Data;
use Spatie\LaravelData\Optional;

final class CreateProjectDTO extends Data
{
    /** @param list<string>|Optional $locales */
    public function __construct(
        public string $key,
        public string $name,
        public array|Optional $locales,
    ) {}

    /** @return array<string, list<mixed>> */
    public static function rules(): array
    {
        return [
            'key' => ['required', 'string', 'max:64', 'alpha_dash', 'unique:projects,key'],
            'name' => ['required', 'string', 'max:255'],
            'locales' => ['sometimes', 'array', 'min:1'],
            'locales.*' => ['string', 'max:10'],
        ];
    }
}
