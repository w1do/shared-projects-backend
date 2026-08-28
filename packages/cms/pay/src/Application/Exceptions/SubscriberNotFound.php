<?php

declare(strict_types=1);

namespace Cms\Pay\Application\Exceptions;

/** Локальный подписчик не существует в проекте либо тип подписчика неизвестен. */
final class SubscriberNotFound extends DomainRuleViolation
{
    public static function make(): self
    {
        // Текст — контракт ответа admin-оформления.
        return self::withMessages([
            'subscriber' => ['Unknown subscriber.'],
        ]);
    }
}
