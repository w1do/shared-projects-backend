<?php

declare(strict_types=1);

namespace Cms\Pay\Application\Exceptions;

/** Предмет подписки не резолвится или не предоставляет контракт подписки. */
final class SubjectNotSubscribable extends DomainRuleViolation
{
    public static function make(): self
    {
        // Текст — контракт ответа admin-оформления (снимок admin-subscribe-422-subject).
        return self::withMessages([
            'subject' => ['Unknown or non-subscribable subject.'],
        ]);
    }
}
