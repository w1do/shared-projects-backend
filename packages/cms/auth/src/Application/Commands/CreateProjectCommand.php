<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Commands;

use Cms\Auth\Application\DTOs\Project\CreateProjectDTO;
use Cms\Auth\Domain\Models\Admin;

/** Команда-намерение: данные для CreateProjectHandler. */
final readonly class CreateProjectCommand
{
    public function __construct(
        public CreateProjectDTO $data,
        public Admin $creator,
    ) {}
}
