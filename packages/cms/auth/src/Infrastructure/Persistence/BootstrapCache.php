<?php

declare(strict_types=1);

namespace Cms\Auth\Infrastructure\Persistence;

use Illuminate\Support\Facades\Cache;

/** Кэш bootstrap-манифеста: сбрасывается при регистрации манифестов и смене ролей. */
final class BootstrapCache
{
    public static function key(int $adminId, ?string $projectId): string
    {
        $version = Cache::get('bootstrap:version', 1);

        return sprintf('bootstrap:%d:%s:%d', $adminId, $projectId ?? '-', $version);
    }

    public static function bump(): void
    {
        Cache::increment('bootstrap:version');
    }
}
