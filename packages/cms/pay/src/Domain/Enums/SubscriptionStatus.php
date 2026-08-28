<?php

declare(strict_types=1);

namespace Cms\Pay\Domain\Enums;

/**
 * Жизненный цикл подписки: active → paused → active (resume),
 * active → canceled (до конца оплаченного периода, можно resume),
 * past_due — неуспешное продление с ретраями. Удаление — soft-delete.
 */
enum SubscriptionStatus: string
{
    case Active = 'active';
    case Paused = 'paused';
    case Canceled = 'canceled';
    case PastDue = 'past_due';
    case Expired = 'expired';

    public function canTransitionTo(self $target): bool
    {
        return match ($this) {
            self::Active => in_array($target, [self::Paused, self::Canceled, self::PastDue, self::Expired], true),
            self::Paused => in_array($target, [self::Active, self::Canceled], true),
            self::Canceled => $target === self::Active, // возобновление до конца периода
            // self-переход past_due → past_due разрешён (Д17): повторное
            // неуспешное продление инкрементирует renewal_attempts, не роняя ретраи
            self::PastDue => in_array($target, [self::Active, self::Expired, self::Canceled, self::PastDue], true),
            self::Expired => $target === self::Active,
        };
    }

    public function grantsAccess(): bool
    {
        return in_array($this, [self::Active, self::Canceled, self::PastDue], true);
    }
}
