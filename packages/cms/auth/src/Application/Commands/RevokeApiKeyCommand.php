<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Commands;

use Cms\Auth\Domain\Models\Project;
use Cms\Auth\Domain\Models\ProjectApiKey;

/** Команда-намерение: данные для RevokeApiKeyHandler. */
final readonly class RevokeApiKeyCommand
{
    public function __construct(
        public Project $project,
        public ProjectApiKey $key,
    ) {}
}
