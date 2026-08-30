<?php

declare(strict_types=1);

namespace Cms\Auth\Application\DTOs\Permission;

use Spatie\LaravelData\Data;

/** Итог синхронизации каталога прав: что изменилось и что осиротело. */
final class PermissionSyncSummaryDTO extends Data
{
    /** @param  list<string>  $orphans  права, которых нет ни в одном манифесте */
    public function __construct(
        public int $manifests,
        public int $added,
        public int $updated,
        public int $projects,
        public int $roles,
        public array $orphans,
        public bool $pruned,
    ) {}
}
