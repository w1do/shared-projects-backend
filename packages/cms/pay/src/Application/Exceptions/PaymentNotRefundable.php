<?php

declare(strict_types=1);

namespace Cms\Pay\Application\Exceptions;

/** Возврат допустим только по успешному (в т.ч. частично возвращённому) платежу. */
final class PaymentNotRefundable extends DomainRuleViolation
{
    public static function make(): self
    {
        // Текст — часть контракта ответа (снимок admin-payment-refund-422-status).
        return self::withMessages([
            'status' => ['Only succeeded payments can be refunded.'],
        ]);
    }
}
