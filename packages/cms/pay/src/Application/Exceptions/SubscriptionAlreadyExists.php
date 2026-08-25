<?php

declare(strict_types=1);

namespace Cms\Pay\Application\Exceptions;

/** У пользователя уже есть живая подписка на этот план. */
final class SubscriptionAlreadyExists extends DomainRuleViolation
{
    public static function make(): self
    {
        // Текст — часть контракта ответа (снимок public-subscribe-422-duplicate).
        return self::withMessages([
            'plan_code' => ['Subscription already exists.'],
        ]);
    }
}
