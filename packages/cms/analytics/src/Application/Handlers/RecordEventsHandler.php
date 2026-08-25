<?php

declare(strict_types=1);

namespace Cms\Analytics\Application\Handlers;

use Cms\Analytics\Application\Commands\RecordEventsCommand;
use Cms\Analytics\Application\DTOs\Event\EventRowDTO;
use Cms\Analytics\Domain\Contracts\IpAnonymizer;
use Cms\Analytics\Domain\Contracts\UserAgentProfiler;
use Cms\Analytics\Domain\ValueObjects\EventName;
use Cms\Analytics\Domain\ValueObjects\IngestionContext;
use Cms\Analytics\Infrastructure\Persistence\EventBuffer;

/** Нормализация и запись событий в буфер. ~микросекунды, не блокирует запрос. */
final class RecordEventsHandler
{
    public function __construct(
        private readonly EventBuffer $buffer,
        private readonly UserAgentProfiler $profiler,
        private readonly IpAnonymizer $ips,
    ) {}

    /** @return int сколько событий батча принято (остальные отбракованы молча) */
    public function handle(RecordEventsCommand $command): int
    {
        $context = new IngestionContext(
            projectId: $command->projectId,
            source: $command->source,
            client: $this->profiler->profile($command->userAgent),
            ipHash: $this->ips->hash($command->ip),
        );

        $accepted = 0;

        foreach ($command->events as $event) {
            $name = EventName::tryFrom($event['name'] ?? null);
            if ($name === null) {
                continue;
            }

            $this->buffer->push(EventRowDTO::fromEvent($event, $name, $context)->toArray());
            $accepted++;
        }

        return $accepted;
    }
}
