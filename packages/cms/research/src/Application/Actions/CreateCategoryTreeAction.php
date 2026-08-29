<?php

declare(strict_types=1);

namespace Cms\Research\Application\Actions;

use Cms\Content\Domain\Models\Category;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Contracts\Translation\Translator;
use Illuminate\Database\ConnectionInterface;
use Illuminate\Support\Str;

/**
 * Создание дерева категорий по плоскому списку с parent_slug.
 *
 * Применяется целиком или не применяется вовсе: ошибка на середине списка не
 * оставляет части дерева созданной. Существующая по слагу категория остаётся
 * как есть, поэтому повтор идемпотентен.
 */
final readonly class CreateCategoryTreeAction
{
    public function __construct(
        private ConnectionInterface $connection,
        private Translator $translator,
        private ProjectContext $context,
    ) {}

    /**
     * @param  list<array{name: string, slug: string, parent_slug: ?string}>  $rows
     * @return int число созданных категорий
     */
    public function handle(array $rows): int
    {
        if ($rows === []) {
            return 0;
        }

        return (int) $this->connection->transaction(function () use ($rows): int {
            $existing = Category::query()->pluck('id', 'slug')->all();
            $created = 0;

            foreach ($this->ordered($rows) as $row) {
                $slug = $this->slug($row);

                if (isset($existing[$slug])) {
                    continue;
                }

                $category = new Category;
                // Проект ставится до вставки в дерево: nested set сверяет scope
                // узлов, а трейт заполнил бы project_id только на сохранении.
                $category->project_id = $this->context->required();
                $category->setTranslation('name', $this->translator->getLocale(), $row['name']);
                $category->slug = $slug;

                $parentSlug = $row['parent_slug'] ?? null;
                $parentId = $parentSlug === null ? null : ($existing[$parentSlug] ?? null);

                if ($parentId === null) {
                    $category->saveAsRoot();
                } else {
                    $category->appendToNode(Category::query()->findOrFail($parentId))->save();
                }

                $existing[$slug] = $category->getKey();
                $created++;
            }

            return $created;
        });
    }

    /**
     * Корни идут первыми: родитель обязан существовать к моменту вставки потомка.
     *
     * @param  list<array{name: string, slug: string, parent_slug: ?string}>  $rows
     * @return list<array{name: string, slug: string, parent_slug: ?string}>
     */
    private function ordered(array $rows): array
    {
        $roots = array_values(array_filter($rows, static fn (array $row): bool => ($row['parent_slug'] ?? null) === null));
        $children = array_values(array_filter($rows, static fn (array $row): bool => ($row['parent_slug'] ?? null) !== null));

        return array_merge($roots, $children);
    }

    /** @param array{name: string, slug: string, parent_slug: ?string} $row */
    private function slug(array $row): string
    {
        $slug = trim($row['slug']);

        return $slug !== '' ? $slug : Str::slug($row['name']);
    }
}
