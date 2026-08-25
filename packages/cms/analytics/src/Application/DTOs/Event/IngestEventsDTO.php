<?php

declare(strict_types=1);

namespace Cms\Analytics\Application\DTOs\Event;

use Spatie\LaravelData\Data;

/**
 * Конверт service-to-service приёма событий.
 *
 * `project_id` и `source` здесь — поля КАЖДОГО события, а не батча
 * (Safety Protocol, И17): один батч может нести события разных проектов.
 */
final class IngestEventsDTO extends Data
{
    /**
     * Элементы намеренно не типизированы: поэлементная валидация запрещена (И16),
     * во входе может приехать что угодно — отбраковка выполняется в handler'е.
     *
     * @param  list<mixed>  $events
     */
    public function __construct(public array $events) {}

    /** @param  array<string, mixed>  $validated */
    public static function fromValidated(array $validated): self
    {
        /** @var list<mixed> $events */
        $events = array_values((array) ($validated['events'] ?? []));

        return new self($events);
    }
}
