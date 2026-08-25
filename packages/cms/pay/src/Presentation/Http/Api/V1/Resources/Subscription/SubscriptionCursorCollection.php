<?php

declare(strict_types=1);

namespace Cms\Pay\Presentation\Http\Api\V1\Resources\Subscription;

use Cms\Shared\Http\Resources\ApiCursorCollection;

/**
 * Курсорная страница подписок админки. У сайтового `mine` `meta` НЕТ —
 * там непагинированная коллекция (И5, guard 0.6).
 */
final class SubscriptionCursorCollection extends ApiCursorCollection
{
    public $collects = SubscriptionCursorItemResource::class;
}
