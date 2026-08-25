<?php

declare(strict_types=1);

namespace Cms\Auth\Infrastructure\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Http\Client\Factory as HttpFactory;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Psr\Log\LoggerInterface;
use Throwable;

/**
 * Best-effort уведомление downstream-сервисов о смене ролей / отзыве ключей.
 *
 * Раньше этот цикл HTTP-запросов (3 URL × 2 с таймаута) выполнялся прямо в
 * запросе оператора из семи handlers: любой недоступный сервис добавлял секунды
 * к ответу панели. Доставка — не часть операции: она best-effort и по смыслу
 * асинхронна, поэтому уезжает в очередь.
 */
final class NotifyDownstreamCacheBustJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    /** @param  array<string, mixed>  $payload */
    public function __construct(public readonly array $payload) {}

    public function handle(HttpFactory $http, LoggerInterface $log): void
    {
        foreach ((array) config('cms-auth.downstream_urls', []) as $url) {
            try {
                $http->baseUrl((string) $url)
                    ->timeout(2)
                    ->withToken((string) config('cms.service_token'), 'Service')
                    ->post('/internal/cache-bust', $this->payload);
            } catch (Throwable $e) {
                $log->info('downstream cache-bust skipped', ['url' => $url, 'reason' => $e->getMessage()]);
            }
        }
    }
}
