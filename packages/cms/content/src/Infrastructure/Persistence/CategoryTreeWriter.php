<?php

declare(strict_types=1);

namespace Cms\Content\Infrastructure\Persistence;

use Cms\Content\Domain\Models\Category;

/**
 * Запись в nested set категорий: блокировка дерева проекта и три операции
 * перемещения. Извлечено из `MoveCategoryHandler` (задача 5.8) — детали
 * kalnoy/nestedset не должны жить в Application.
 */
final class CategoryTreeWriter
{
    /**
     * Блокировка строк дерева проекта: конкурентные перемещения не должны
     * порвать lft/rgt. Вызывается внутри транзакции вызывающего кода.
     */
    public function lockTree(Category $category): void
    {
        Category::query()
            ->where('project_id', $category->project_id)
            ->lockForUpdate()
            ->get(['id']);
    }

    /** Узел уезжает в корень ВМЕСТЕ с поддеревом. */
    public function moveToRoot(Category $category): void
    {
        $category->saveAsRoot();
    }

    /** Узел с поддеревом становится последним потомком родителя. */
    public function moveUnder(Category $category, Category $parent): void
    {
        $category->appendToNode($parent)->save();
    }

    /**
     * Позиция среди соседей: индекс в списке уровня без самого узла.
     * 0 — первым, i — перед соседом с этим индексом, за пределами списка — последним.
     */
    public function placeAmongSiblings(Category $category, int $position): void
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
