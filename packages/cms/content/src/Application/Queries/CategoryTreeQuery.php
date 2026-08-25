<?php

declare(strict_types=1);

namespace Cms\Content\Application\Queries;

use Cms\Content\Application\DTOs\Category\CategoryDTO;
use Cms\Content\Domain\Models\Category;
use Kalnoy\Nestedset\Collection;

final class CategoryTreeQuery
{
    /** @return list<CategoryDTO> */
    public function handle(): array
    {
        /** @var Collection<int, Category> $nodes нестандартная коллекция NodeTrait::newCollection() */
        $nodes = Category::query()->with('seo')->orderBy('_lft')->get();

        return array_values(array_map(
            CategoryDTO::fromModel(...),
            array_filter($nodes->toTree()->all(), fn ($c) => $c instanceof Category),
        ));
    }
}
