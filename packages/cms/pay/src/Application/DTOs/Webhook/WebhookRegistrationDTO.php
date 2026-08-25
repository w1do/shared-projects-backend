<?php

declare(strict_types=1);

namespace Cms\Pay\Application\DTOs\Webhook;

use Spatie\LaravelData\Data;

/**
 * Итог регистрации сырого вебхука. Дубль по (provider, external_id) не
 * создаёт записи и не диспатчит обработку, но для провайдера это тоже успех.
 */
final class WebhookRegistrationDTO extends Data
{
    public function __construct(
        public ?int $eventId,
        public bool $duplicate,
    ) {}

    public static function registered(int $eventId): self
    {
        return new self(eventId: $eventId, duplicate: false);
    }

    public static function duplicate(): self
    {
        return new self(eventId: null, duplicate: true);
    }
}
