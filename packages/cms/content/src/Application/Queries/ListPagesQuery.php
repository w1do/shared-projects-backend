<?php

declare(strict_types=1);

namespace Cms\Content\Application\Queries;

use Cms\Content\Application\DTOs\Page\PageDTO;
use Cms\Content\Domain\Models\Page;
use Illuminate\Support\Collection;

final class ListPagesQuery
{
    /**
     * Полный список страниц проекта: непагинированная коллекция без meta —
     * форма ответа не меняется (Safety Protocol, И5).
     *
     * @return Collection<int, PageDTO>
     */
    public function handle(): Collection
    {
        return Page::query()
            ->with('seo')
            ->orderByDesc('id')
            ->get()
            ->map(PageDTO::fromModel(...));
    }
}
