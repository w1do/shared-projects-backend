<?php

declare(strict_types=1);

namespace Cms\Content\Application\Queries;

use Cms\Content\Domain\Models\MediaFile;

/** Медиа-файл существует и принадлежит текущему проекту (границу задаёт scope проекта). */
final class ProjectMediaExistsQuery
{
    public function handle(int $mediaId): bool
    {
        return MediaFile::query()->whereKey($mediaId)->exists();
    }
}
