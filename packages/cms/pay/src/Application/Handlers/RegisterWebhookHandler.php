<?php

declare(strict_types=1);

namespace Cms\Pay\Application\Handlers;

use Cms\Pay\Application\Commands\RegisterWebhookCommand;
use Cms\Pay\Domain\Models\WebhookEvent;
use Cms\Pay\Infrastructure\Jobs\ProcessWebhookEventJob;
use Illuminate\Database\UniqueConstraintViolationException;

/**
 * Регистрация сырого вебхука: unique(provider, external_id) — дубль
 * не создаёт записи и не диспатчит обработку. Бизнес-логики здесь нет.
 */
final class RegisterWebhookHandler
{
    /** @return array{event: ?WebhookEvent, duplicate: bool} */
    public function handle(RegisterWebhookCommand $command): array
    {
        try {
            $event = WebhookEvent::create([
                'provider' => $command->provider,
                'external_id' => $command->externalId,
                'payload' => $command->payload,
            ]);
        } catch (UniqueConstraintViolationException) {
            return ['event' => null, 'duplicate' => true];
        }

        ProcessWebhookEventJob::dispatch($event->id)->onQueue('webhooks');

        return ['event' => $event, 'duplicate' => false];
    }
}
