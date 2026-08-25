<?php

declare(strict_types=1);

namespace Cms\Auth\Presentation\Http\Api\V1\Resources\Audit;

use Cms\Shared\Http\Resources\ApiCursorCollection;

/** Курсорная страница журнала аудита: `data` + `meta` ровно из трёх ключей. */
final class AuditEntryCollection extends ApiCursorCollection
{
    /** @var class-string */
    public $collects = AuditEntryResource::class;
}
