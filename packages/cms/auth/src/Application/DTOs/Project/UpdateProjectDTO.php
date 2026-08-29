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
        public string|null|Optional $description = new Optional,
        public string|null|Optional $topic = new Optional,
    ) {}

}
