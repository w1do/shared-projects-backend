<?php

declare(strict_types=1);

namespace Cms\Content\Application\DTOs\Category;

use Cms\Content\Application\DTOs\Seo\SeoDTO;
use Cms\Content\Domain\Models\Category;
use Spatie\LaravelData\Data;

final class CategoryDTO extends Data
{
    /**
     * @param  array<string, string>  $name_translations  полный набор по локалям
     * @param  list<CategoryDTO>  $children
     */
    public function __construct(
        public int $id,
        public string $name,
        public array $name_translations,
        public string $slug,
        public ?int $parent_id,
        public bool $is_index,
        public ?SeoDTO $seo = null,
        public array $children = [],
    ) {}

    public static function fromModel(Category $category): self
    {
        return new self(
            id: $category->id,
            // строка текущей/дефолтной локали — существующие потребители не меняются
            name: (string) $category->name,
            name_translations: $category->getTranslations('name'),
            slug: $category->slug,
            parent_id: $category->parent_id,
            is_index: $category->is_index,
            seo: $category->relationLoaded('seo') && $category->seo ? SeoDTO::fromModel($category->seo) : null,
            children: $category->relationLoaded('children')
                ? array_values(array_map(
                    self::fromModel(...),
                    array_filter($category->children->all(), fn ($c) => $c instanceof Category),
                ))
                : [],
        );
    }
}
