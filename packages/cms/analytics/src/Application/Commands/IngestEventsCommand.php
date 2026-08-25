<?php

declare(strict_types=1);

namespace Cms\Analytics\Application\Commands;

/** Команда-намерение: данные для IngestEventsHandler. */
final readonly class IngestEventsCommand
{
    /** @param  list<mixed>  $events */
    public function __construct(
        public array $events,
        public string $defaultSource = 'service',
    ) {}
}
