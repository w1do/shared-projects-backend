<?php

declare(strict_types=1);

namespace Cms\Licensing\Presentation\Http\Api\V1\Resources\Organization;

use Cms\Shared\Http\Resources\ApiCursorCollection;

/** Курсорная страница организаций: meta ровно per_page/next_cursor/prev_cursor (И5). */
final class OrganizationCursorCollection extends ApiCursorCollection
{
    public $collects = OrganizationCursorItemResource::class;
}
