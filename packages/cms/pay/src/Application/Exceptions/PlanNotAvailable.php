<?php

declare(strict_types=1);

namespace Cms\Pay\Application\Exceptions;

/** План не найден либо архивирован — подписаться на него нельзя. */
final class PlanNotAvailable extends DomainRuleViolation
{
    public static function make(): self
    {
        // Текст — часть контракта ответа (снимки public-subscribe-422-unknown-plan,
        // public-subscribe-422-archived-plan): обе ветки дают одно сообщение.
        return self::withMessages([
            'plan_code' => ['Unknown or archived plan.'],
        ]);
    }
}
