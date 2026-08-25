<?php

declare(strict_types=1);

namespace Cms\Content\Application\Handlers;

use Cms\Content\Application\Commands\MoveCategoryCommand;
use Cms\Content\Application\Exceptions\ContentRuleViolation;
use Cms\Content\Domain\Models\Category;
use Cms\Content\Infrastructure\Persistence\CategoryTreeWriter;
use Illuminate\Support\Facades\DB;
use Spatie\LaravelData\Optional;

/**
 * Перемещение узла со всем поддеревом. Атомарно: транзакция + блокировка
 * строк дерева проекта, чтобы конкурентные перемещения не порвали lft/rgt.
 */
final class MoveCategoryHandler
{
    public function __construct(private readonly CategoryTreeWriter $tree) {}

    public function handle(MoveCategoryCommand $command): Category
    {
        return DB::transaction(function () use ($command) {
            $this->tree->lockTree($command->category);

            // «Ключ отсутствует» ≠ «ключ = null»: без parent_id узел остаётся на
            // месте, явный null уводит его в корень вместе с поддеревом (И1).
            if (! $command->data->parent_id instanceof Optional) {
                $this->reparent($command->category, $command->data->parent_id);
            }

            if (! $command->data->position instanceof Optional) {
                $this->tree->placeAmongSiblings($command->category, $command->data->position);
            }

            return $command->category->fresh() ?? $command->category;
        });
    }

    private function reparent(Category $category, ?int $parentId): void
    {
        if ($parentId === null) {
            $this->tree->moveToRoot($category);

            return;
        }

        $parent = Category::query()->findOrFail($parentId);

        // Замыкание дерева на себя — доменный инвариант (Category::wouldCycleUnder)
        if ($category->wouldCycleUnder($parent)) {
            throw ContentRuleViolation::categoryMovedUnderOwnDescendant();
        }

        $this->tree->moveUnder($category, $parent);
    }
}
