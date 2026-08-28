<?php

declare(strict_types=1);

namespace Cms\Pay\Application\DTOs\Subscription;

use Cms\Shared\Billing\Subscriber;
use Spatie\LaravelData\Data;

/** Полиморфный подписчик в ответах: объект `{type, id}` вместо строки user_key. */
final class SubscriberDTO extends Data
{
    public function __construct(
        public string $type,
        public string $id,
    ) {}

    public static function fromSubscriber(Subscriber $subscriber): self
    {
        return new self(type: $subscriber->type, id: $subscriber->id);
    }
}
