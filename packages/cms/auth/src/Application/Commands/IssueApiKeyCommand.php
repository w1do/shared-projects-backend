<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Commands;

use Cms\Auth\Application\DTOs\ApiKey\IssueApiKeyDTO;
use Cms\Auth\Domain\Models\Project;

/** Команда-намерение: данные для IssueApiKeyHandler. */
final readonly class IssueApiKeyCommand
{
    public function __construct(
        public Project $project,
        public IssueApiKeyDTO $data,
    ) {}
}
