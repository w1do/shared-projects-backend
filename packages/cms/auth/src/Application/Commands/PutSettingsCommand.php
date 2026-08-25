<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Commands;

use Cms\Auth\Application\DTOs\Setting\SettingsPayloadDTO;
use Cms\Auth\Domain\Models\Project;

/** Команда-намерение: данные для PutSettingsHandler. */
final readonly class PutSettingsCommand
{
    public function __construct(
        public Project $project,
        public string $service,
        public SettingsPayloadDTO $data,
    ) {}
}
