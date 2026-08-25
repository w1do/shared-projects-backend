<?php

declare(strict_types=1);

namespace Cms\Pay\Application\Exceptions;

/** Сумма возврата вне остатка, доступного к возврату по платежу. */
final class RefundExceedsRefundable extends DomainRuleViolation
{
    public static function make(): self
    {
        // Текст — часть контракта ответа (снимок admin-payment-refund-422-exceeds).
        return self::withMessages([
            'amount_minor' => ['Refund exceeds the refundable amount.'],
        ]);
    }
}
