<?php

declare(strict_types=1);

namespace Cms\Pay\Application\Exceptions;

use Cms\Pay\Domain\Enums\PaymentStatus;

/** Переход статуса платежа запрещён статус-машиной `PaymentStatus`. */
final class PaymentTransitionNotAllowed extends DomainRuleViolation
{
    public static function between(PaymentStatus $from, PaymentStatus $to): self
    {
        // Текст сообщения — часть контракта ответа (снимок admin-payment-confirm-422).
        return self::withMessages([
            'status' => ["Transition {$from->value} → {$to->value} is not allowed."],
        ]);
    }
}
