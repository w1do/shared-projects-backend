<?php

declare(strict_types=1);

namespace Cms\Pay\Domain\Enums;

enum TransactionType: string
{
    case Charge = 'charge';
    case Refund = 'refund';
}
