<?php

declare(strict_types=1);

namespace Cms\Shared\Analytics;

use Cms\Contracts\Events\AnalyticsEvent;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Support\Facades\Facade;
use Illuminate\Support\Str;

/**
 * Фасад истории пользователя: Analytics::push($key, $history).
 * $key — субъект: "user:{project}:{id}", "anon:{anon_id}", "admin:{id}".
 * $history — имя события либо массив с name/props/value_minor/currency.
 *
 * @method static void record(AnalyticsEvent $event)
 */
final class Analytics extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return AnalyticsRecorder::class;
    }

    public static function push(string $key, string|array $history, ?string $projectId = null): void
    {
        $data = is_string($history) ? ['name' => $history] : $history;

        $projectId ??= $data['project_id']
            ?? (str_starts_with($key, 'user:') ? explode(':', $key)[1] : null)
            ?? app(ProjectContext::class)->id();

        if ($projectId === null) {
            return; // событие без проекта записать некуда
        }

        self::record(new AnalyticsEvent(
            eventId: (string) Str::uuid7(),
            projectId: $projectId,
            name: $data['name'],
            subjectKey: $key,
            occurredAt: now()->toIso8601String(),
            source: $data['source'] ?? 'service',
            props: $data['props'] ?? [],
            valueMinor: (int) ($data['value_minor'] ?? 0),
            currency: $data['currency'] ?? null,
        ));
    }
}
