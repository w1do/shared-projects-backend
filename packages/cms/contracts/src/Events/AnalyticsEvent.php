<?php

declare(strict_types=1);

namespace Cms\Contracts\Events;

/**
 * Событие аналитики: контракт между всеми сервисами и analytics-service.
 * Денежные значения — только целые минорные единицы.
 */
final readonly class AnalyticsEvent
{
    public function __construct(
        public string $eventId,
        public string $projectId,
        public string $name,
        public string $subjectKey,
        public string $occurredAt,
        public string $source = 'service',
        public array $props = [],
        public int $valueMinor = 0,
        public ?string $currency = null,
    ) {}

    public function toArray(): array
    {
        return [
            'event_id' => $this->eventId,
            'project_id' => $this->projectId,
            'name' => $this->name,
            'subject_key' => $this->subjectKey,
            'occurred_at' => $this->occurredAt,
            'source' => $this->source,
            'props' => $this->props,
            'value_minor' => $this->valueMinor,
            'currency' => $this->currency,
        ];
    }

    public static function fromArray(array $data): self
    {
        return new self(
            eventId: $data['event_id'],
            projectId: $data['project_id'],
            name: $data['name'],
            subjectKey: $data['subject_key'],
            occurredAt: $data['occurred_at'],
            source: $data['source'] ?? 'service',
            props: $data['props'] ?? [],
            valueMinor: (int) ($data['value_minor'] ?? 0),
            currency: $data['currency'] ?? null,
        );
    }
}
