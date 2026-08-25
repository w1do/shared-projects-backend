<?php

declare(strict_types=1);

namespace Cms\Pay\Domain\Enums;

/** Статус-машина платежа. Переходы — только через canTransitionTo. */
enum PaymentStatus: string
{
    case Created = 'created';
    case Pending = 'pending';
    case Succeeded = 'succeeded';
    case Failed = 'failed';
    case Canceled = 'canceled';
    case RefundedPartial = 'refunded_partial';
    case RefundedFull = 'refunded_full';

    public function canTransitionTo(self $target): bool
    {
        return match ($this) {
            self::Created => in_array($target, [self::Pending, self::Succeeded, self::Failed, self::Canceled], true),
            self::Pending => in_array($target, [self::Succeeded, self::Failed, self::Canceled], true),
            self::Succeeded => in_array($target, [self::RefundedPartial, self::RefundedFull], true),
            self::RefundedPartial => $target === self::RefundedFull,
            self::Failed, self::Canceled, self::RefundedFull => false,
        };
    }
}
