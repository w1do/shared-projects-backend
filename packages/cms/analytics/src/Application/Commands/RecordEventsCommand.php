<?php

declare(strict_types=1);

namespace Cms\Analytics\Application\Commands;

/** Команда-намерение: данные для RecordEventsHandler. */
final readonly class RecordEventsCommand
{
    public function __construct(
        public string $projectId,
        public array $events,
        public string $source,
        public ?string $ip = null,
        public ?string $userAgent = null,
    ) {}
}
