<?php

declare(strict_types=1);

namespace Cms\Content\Application\Queries;

use Cms\Content\Domain\Models\Category;

/**
 * Идентификаторы категории вместе со всем её поддеревом — для фильтра списка
 * постов «категория и её потомки».
 *
 * Извлечено из `ListPostsQuery` (задача 5.10). `null` вместо пустого списка —
 * это НЕ то же самое: несуществующая категория означает «фильтр не применять»
 * (прежнее поведение), а пустой список отфильтровал бы выдачу в ноль.
 */
final class CategoryDescendantIdsQuery
{
    /** @return ?list<int> */
    public function handle(int $categoryId): ?array
    {
        $category = Category::query()->find($categoryId);

        if ($category === null) {
            return null;
        }

        /** @var list<int> $ids */
        $ids = $category->descendants()->get()->pluck('id')->push($category->id)->values()->all();

        return $ids;
    }
}
