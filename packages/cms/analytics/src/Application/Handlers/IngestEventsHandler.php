<?php

declare(strict_types=1);

namespace Cms\Analytics\Application\Handlers;

use Cms\Analytics\Application\Commands\IngestEventsCommand;
use Cms\Analytics\Application\Commands\RecordEventsCommand;
use Cms\Analytics\Application\DTOs\Event\AcceptedEventsDTO;

/**
 * Приём service-to-service батча: события разных проектов в одном запросе.
 *
 * Safety Protocol, И17 — батч НЕ схлопывается по тенанту: `project_id` и `source`
 * читаются у каждого события. Соседние события с одинаковой парой (project_id, source)
 * объединяются в один вызов `RecordEventsHandler`, смена пары начинает новый батч —
 * так и принадлежность событий, и порядок записи в буфер остаются прежними.
 *
 * Событие без `project_id` молча пропускается и в `accepted` не попадает (п. Б5).
 */
final class IngestEventsHandler
{
    public function __construct(private readonly RecordEventsHandler $record) {}

    public function handle(IngestEventsCommand $command): AcceptedEventsDTO
    {
        $accepted = 0;

        foreach ($this->batches($command->events, $command->defaultSource) as $batch) {
            $accepted += $this->record->handle(new RecordEventsCommand(
                projectId: $batch['projectId'],
                events: $batch['events'],
                source: $batch['source'],
            ));
        }

        return new AcceptedEventsDTO($accepted);
    }

    /**
     * Разбиение входа на последовательные группы по паре (project_id, source).
     *
     * @param  list<mixed>  $events
     * @return list<array{projectId: string, source: string, events: list<array<string, mixed>>}>
     */
    private function batches(array $events, string $defaultSource): array
    {
        $batches = [];

        foreach ($events as $event) {
            if (! is_array($event) || ! isset($event['project_id'])) {
                continue;
            }

            $projectId = (string) $event['project_id'];
            $source = (string) ($event['source'] ?? $defaultSource);
            $last = array_key_last($batches);

            if ($last !== null && $batches[$last]['projectId'] === $projectId && $batches[$last]['source'] === $source) {
                $batches[$last]['events'][] = $event;

                continue;
            }

            $batches[] = ['projectId' => $projectId, 'source' => $source, 'events' => [$event]];
        }

        return $batches;
    }
}
