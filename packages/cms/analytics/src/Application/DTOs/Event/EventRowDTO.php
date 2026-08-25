<?php

declare(strict_types=1);

namespace Cms\Analytics\Application\DTOs\Event;

use Cms\Analytics\Domain\ValueObjects\EventName;
use Cms\Analytics\Domain\ValueObjects\EventOccurredAt;
use Cms\Analytics\Domain\ValueObjects\IngestionContext;
use Illuminate\Support\Str;
use Spatie\LaravelData\Data;

/**
 * Нормализованная строка события — ровно колонки таблицы `events` в ClickHouse
 * и ровно в том же порядке: DTO целиком уходит в буфер как строка батч-INSERT.
 *
 * Нормализация намеренно «прощающая» (п. Б5): недостающие поля заменяются
 * значениями по умолчанию колонок, `currency: null` гасится в `''`, а не даёт 422.
 */
final class EventRowDTO extends Data
{
    public function __construct(
        public string $project_id,
        public string $event_id,
        public string $occurred_at,
        public string $name,
        public string $source,
        public string $subject_key,
        public string $session_id,
        public string $path,
        public string $referrer,
        public string $utm_source,
        public string $utm_medium,
        public string $utm_campaign,
        public string $device,
        public string $os,
        public string $browser,
        public string $ip_hash,
        public int $value_minor,
        public string $currency,
        public string $props,
    ) {}

    /** @param  array<mixed>  $event сырое событие из запроса, без поэлементной валидации */
    public static function fromEvent(array $event, EventName $name, IngestionContext $context): self
    {
        return new self(
            project_id: $context->projectId,
            event_id: (string) ($event['event_id'] ?? Str::uuid7()),
            occurred_at: EventOccurredAt::toStorageFormat($event['occurred_at'] ?? null),
            name: $name->value,
            source: $context->source,
            subject_key: (string) ($event['subject_key'] ?? ('anon:'.($event['anon_id'] ?? 'unknown'))),
            session_id: (string) ($event['session_id'] ?? ''),
            path: (string) ($event['path'] ?? ''),
            referrer: (string) ($event['referrer'] ?? ''),
            utm_source: (string) ($event['utm_source'] ?? ''),
            utm_medium: (string) ($event['utm_medium'] ?? ''),
            utm_campaign: (string) ($event['utm_campaign'] ?? ''),
            device: $context->client->device,
            os: $context->client->os,
            browser: $context->client->browser,
            ip_hash: $context->ipHash,
            value_minor: (int) ($event['value_minor'] ?? 0),
            currency: (string) ($event['currency'] ?? ''),
            props: (string) json_encode($event['props'] ?? [], JSON_UNESCAPED_UNICODE),
        );
    }

    /**
     * Строка батча собирается явно, а не через трансформеры spatie: приём событий —
     * самый горячий путь пакета (до 100 событий в запросе), а состав и порядок колонок
     * должны совпадать с таблицей `events` буквально.
     *
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'project_id' => $this->project_id,
            'event_id' => $this->event_id,
            'occurred_at' => $this->occurred_at,
            'name' => $this->name,
            'source' => $this->source,
            'subject_key' => $this->subject_key,
            'session_id' => $this->session_id,
            'path' => $this->path,
            'referrer' => $this->referrer,
            'utm_source' => $this->utm_source,
            'utm_medium' => $this->utm_medium,
            'utm_campaign' => $this->utm_campaign,
            'device' => $this->device,
            'os' => $this->os,
            'browser' => $this->browser,
            'ip_hash' => $this->ip_hash,
            'value_minor' => $this->value_minor,
            'currency' => $this->currency,
            'props' => $this->props,
        ];
    }
}
