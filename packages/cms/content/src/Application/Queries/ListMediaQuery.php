<?php

declare(strict_types=1);

namespace Cms\Content\Application\Queries;

use Cms\Content\Application\DTOs\Media\MediaDTO;
use Cms\Content\Domain\Models\MediaFile;
use Illuminate\Pagination\CursorPaginator;

final class ListMediaQuery
{
    /**
     * Медиатека проекта: курсорная пагинация по id (форма списка прежняя, И5).
     *
     * @return CursorPaginator<int, MediaDTO>
     */
    public function handle(int $perPage = 50): CursorPaginator
    {
        /** @var CursorPaginator<int, MediaFile> $page */
        $page = MediaFile::query()->orderByDesc('id')->cursorPaginate($perPage);

        return $page->through(MediaDTO::fromModel(...));
    }
}
