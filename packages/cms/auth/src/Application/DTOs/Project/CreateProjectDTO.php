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

}
