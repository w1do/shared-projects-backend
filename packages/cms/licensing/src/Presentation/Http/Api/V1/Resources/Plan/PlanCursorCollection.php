<?php

declare(strict_types=1);

namespace Cms\Licensing\Presentation\Http\Api\V1\Resources\Plan;

use Cms\Shared\Http\Resources\ApiCursorCollection;

/** Курсорная страница планов поставки: meta ровно per_page/next_cursor/prev_cursor (И5). */
final class PlanCursorCollection extends ApiCursorCollection
{
    public $collects = PlanCursorItemResource::class;
}
