<?php

declare(strict_types=1);

namespace Cms\Pay\Application\Handlers;

use Cms\Pay\Application\Commands\RegisterWebhookCommand;
use Cms\Pay\Application\DTOs\Webhook\WebhookRegistrationDTO;
use Cms\Pay\Domain\Models\WebhookEvent;
use Cms\Pay\Infrastructure\Jobs\ProcessWebhookEventJob;
use Illuminate\Database\UniqueConstraintViolationException;

/**
 * Регистрация сырого вебхука: unique(provider, external_id) — дубль
 * не создаёт записи и не диспатчит обработку. Бизнес-логики здесь нет.
 */
final class RegisterWebhookHandler
{
    public function handle(RegisterWebhookCommand $command): WebhookRegistrationDTO
    {
        try {
            $event = WebhookEvent::create([
                'provider' => $command->provider,
                'external_id' => $command->externalId,
                'payload' => $command->payload,
            ]);
        } catch (UniqueConstraintViolationException) {
            return WebhookRegistrationDTO::duplicate();
        }

        ProcessWebhookEventJob::dispatch($event->id)->onQueue('webhooks');

        return WebhookRegistrationDTO::registered($event->id);
    }
}
