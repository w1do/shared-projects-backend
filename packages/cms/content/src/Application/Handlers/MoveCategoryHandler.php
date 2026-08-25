<?php

declare(strict_types=1);

namespace Cms\Content\Application\Handlers;

use Cms\Content\Application\Commands\MoveCategoryCommand;
use Cms\Content\Domain\Models\Category;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Spatie\LaravelData\Optional;

/**
 * Перемещение узла со всем поддеревом. Атомарно: транзакция + блокировка
 * строк дерева проекта, чтобы конкурентные перемещения не порвали lft/rgt.
 */
final class MoveCategoryHandler
{
    public function handle(MoveCategoryCommand $command): Category
    {
        return DB::transaction(function () use ($command) {
            Category::query()
                ->where('project_id', $command->category->project_id)
                ->lockForUpdate()
                ->get(['id']);

            if (! $command->data->parent_id instanceof Optional) {
                if ($command->data->parent_id === null) {
                    $command->category->saveAsRoot();
                } else {
                    $parent = Category::query()->findOrFail($command->data->parent_id);

                    if ($parent->getKey() === $command->category->getKey() || $parent->isDescendantOf($command->category)) {
                        throw ValidationException::withMessages(['parent_id' => ['Cannot move a node under its own descendant.']]);
                    }

                    $command->category->appendToNode($parent)->save();
                }
            }

            if (! $command->data->position instanceof Optional) {
                $this->placeAmongSiblings($command->category, $command->data->position);
            }

            return $command->category->fresh() ?? $command->category;
        });
    }

    /**
     * Позиция среди соседей: индекс в списке уровня без самого узла.
     * 0 — первым, i — перед соседом с этим индексом, за пределами списка — последним.
     */
    private function placeAmongSiblings(Category $category, int $position): void
    {
        /** @var list<Category> $siblings */
        $siblings = $category->siblings()->defaultOrder()->get()->values()->all();

        if ($siblings === []) {
            return; // единственный узел уровня — позиция очевидна
        }

        if (isset($siblings[$position])) {
            $category->insertBeforeNode($siblings[$position]);
        } else {
            // Перестановка в конец в пределах того же родителя: appendToNode не
            // вызывался, узел мог стоять в середине — двигаем явно.
            $category->insertAfterNode($siblings[count($siblings) - 1]);
        }
    }
}
