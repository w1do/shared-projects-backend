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
        // Холодный кэш (после flush): ключа нет, а key() подставляет 1 по
        // умолчанию. Голый increment создал бы ключ со значением 1 — ключ кэша
        // не изменился бы, и первый bump не инвалидировал бы записи. add+increment
        // гарантируют, что версия после bump всегда отличается от версии по умолчанию.
        Cache::add('bootstrap:version', 1);
        Cache::increment('bootstrap:version');
    }
}
