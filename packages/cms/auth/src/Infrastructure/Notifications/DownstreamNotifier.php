<?php

declare(strict_types=1);

namespace Cms\Auth\Infrastructure\Notifications;

use Cms\Auth\Infrastructure\Jobs\NotifyDownstreamCacheBustJob;

/** Точка вызова cache-bust downstream-сервисов; сама доставка — в Job. */
final class DownstreamNotifier
{
    /** @param  array<string, mixed>  $payload */
    public function cacheBust(array $payload): void
    {
        NotifyDownstreamCacheBustJob::dispatch($payload);
    }
}
