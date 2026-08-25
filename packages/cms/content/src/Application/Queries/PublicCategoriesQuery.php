<?php

declare(strict_types=1);

namespace Cms\Content\Application\Queries;

use Cms\Content\Application\DTOs\Category\CategoryDTO;
use Cms\Content\Domain\Contracts\ContentCache;
use Cms\Shared\Tenant\ProjectContext;

/**
 * Публичное дерево категорий с кэшированием.
 *
 * В кэше лежит список `CategoryDTO` — форма значения не менялась (И12),
 * поэтому ключ `content:{project}:v{version}:categories` остаётся прежним.
 */
final class PublicCategoriesQuery
{
    public function __construct(
        private readonly ContentCache $cache,
        private readonly ProjectContext $context,
        private readonly CategoryTreeQuery $tree,
    ) {}

    /** @return list<CategoryDTO> */
    public function handle(): array
    {
        /** @var list<CategoryDTO> */
        return $this->cache->remember(
            $this->context->required(),
            'categories',
            fn (): array => $this->tree->handle(),
        );
    }
}
