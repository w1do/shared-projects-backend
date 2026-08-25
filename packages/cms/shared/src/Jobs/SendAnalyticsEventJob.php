<?php

declare(strict_types=1);

namespace Cms\Shared\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/** Доставка одного события в analytics-service по service-каналу; ретраи с пределом. */
final class SendAnalyticsEventJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;

    public int $tries = 5;

    public int $timeout = 15;

    /** @var list<int> */
    public array $backoff = [5, 30, 120, 600];

    public function __construct(public readonly array $event) {}

    public function handle(): void
    {
        Http::baseUrl((string) config('cms.analytics_url'))
            ->timeout(10)
            ->withToken((string) config('cms.service_token'), 'Service')
            ->acceptJson()
            ->post('/internal/events', ['events' => [$this->event]])
            ->throw();
    }

    public function failed(\Throwable $e): void
    {
        Log::error('analytics event delivery failed permanently', [
            'event' => $this->event['event_id'] ?? null,
            'exception' => $e->getMessage(),
        ]);
    }
}
