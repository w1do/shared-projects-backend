<?php

declare(strict_types=1);

namespace Cms\Analytics\Application\Handlers;

use Cms\Analytics\Application\Commands\RecordEventsCommand;
use Cms\Analytics\Infrastructure\Support\EventBuffer;
use Cms\Analytics\Infrastructure\Support\IpHasher;
use Cms\Analytics\Infrastructure\Support\UserAgentParser;
use Illuminate\Support\Str;

/** Нормализация и запись событий в буфер. ~микросекунды, не блокирует запрос. */
final class RecordEventsHandler
{
    public function __construct(private readonly EventBuffer $buffer) {}

    public function handle(RecordEventsCommand $command): int
    {
        $enrichment = UserAgentParser::parse($command->userAgent);
        $ipHash = IpHasher::hash($command->ip);
        $accepted = 0;

        foreach ($command->events as $event) {
            $name = (string) ($event['name'] ?? '');
            if ($name === '' || ! preg_match('/^[a-z0-9_.]+$/', $name)) {
                continue;
            }

            $this->buffer->push([
                'project_id' => $command->projectId,
                'event_id' => (string) ($event['event_id'] ?? Str::uuid7()),
                'occurred_at' => self::toChDateTime($event['occurred_at'] ?? null),
                'name' => $name,
                'source' => $command->source,
                'subject_key' => (string) ($event['subject_key'] ?? ('anon:'.($event['anon_id'] ?? 'unknown'))),
                'session_id' => (string) ($event['session_id'] ?? ''),
                'path' => (string) ($event['path'] ?? ''),
                'referrer' => (string) ($event['referrer'] ?? ''),
                'utm_source' => (string) ($event['utm_source'] ?? ''),
                'utm_medium' => (string) ($event['utm_medium'] ?? ''),
                'utm_campaign' => (string) ($event['utm_campaign'] ?? ''),
                'device' => $enrichment['device'],
                'os' => $enrichment['os'],
                'browser' => $enrichment['browser'],
                'ip_hash' => $ipHash,
                'value_minor' => (int) ($event['value_minor'] ?? 0),
                'currency' => (string) ($event['currency'] ?? ''),
                'props' => json_encode($event['props'] ?? [], JSON_UNESCAPED_UNICODE),
            ]);
            $accepted++;
        }

        return $accepted;
    }

    private static function toChDateTime(?string $iso): string
    {
        $ts = $iso !== null ? strtotime($iso) : false;

        return date('Y-m-d H:i:s', $ts === false ? time() : $ts);
    }
}
