<?php

declare(strict_types=1);

namespace Cms\Auth\Infrastructure\Jobs;

use Cms\Auth\Domain\Models\ProjectApiKey;
use DateTimeInterface;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

/**
 * Отметка «ключ использован». Единственное место мутации `last_used_at`:
 * раньше запись шла прямо из introspection-запроса (Query с побочным эффектом)
 * и дублировалась в middleware сайта.
 *
 * Момент использования передаётся в payload, а не берётся в воркере: между
 * запросом и обработкой может пройти время, и `now()` воркера соврал бы.
 *
 * `ProjectApiKey` — без `BelongsToProject`, глобального скоупа у модели нет,
 * поэтому джобе не нужен контекст проекта (не наследует `ProjectAwareJob`).
 */
final class TouchApiKeyLastUsedJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public function __construct(
        public readonly string $keyId,
        public readonly DateTimeInterface $usedAt,
    ) {}

    public function handle(): void
    {
        $key = ProjectApiKey::query()->whereKey($this->keyId)->first();

        // saveQuietly: отметка использования не должна поднимать доменные события
        $key?->forceFill(['last_used_at' => $this->usedAt])->saveQuietly();
    }
}
