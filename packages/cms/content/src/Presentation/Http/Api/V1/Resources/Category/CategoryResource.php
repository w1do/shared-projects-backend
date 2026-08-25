<?php

declare(strict_types=1);

namespace Cms\Content\Presentation\Http\Api\V1\Resources\Category;

use Cms\Content\Application\DTOs\Category\CategoryDTO;
use Cms\Shared\Http\Resources\ApiResource;
use Illuminate\Http\Request;

/**
 * Категория с поддеревом: `children` уже развёрнуто в DTO, поэтому Resource
 * отдаёт его как есть — форма дерева не меняется.
 *
 * @property CategoryDTO $resource
 */
final class CategoryResource extends ApiResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return $this->resource->toArray();
    }
}
