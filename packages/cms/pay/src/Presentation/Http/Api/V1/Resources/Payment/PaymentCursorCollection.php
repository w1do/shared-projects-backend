<?php

declare(strict_types=1);

namespace Cms\Pay\Presentation\Http\Api\V1\Resources\Payment;

use Cms\Shared\Http\Resources\ApiCursorCollection;

/**
 * Курсорная страница платежей: `meta` состоит РОВНО из `per_page`,
 * `next_cursor`, `prev_cursor` (И5, guard 0.6).
 */
final class PaymentCursorCollection extends ApiCursorCollection
{
    public $collects = PaymentCursorItemResource::class;
}
