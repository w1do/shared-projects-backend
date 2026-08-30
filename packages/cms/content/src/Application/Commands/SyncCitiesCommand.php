<?php

declare(strict_types=1);

namespace Cms\Content\Application\Commands;

/** Синхронизация справочника: без источника читается поставляемая копия. */
final readonly class SyncCitiesCommand
{
    public function __construct(public ?string $source = null) {}
}
