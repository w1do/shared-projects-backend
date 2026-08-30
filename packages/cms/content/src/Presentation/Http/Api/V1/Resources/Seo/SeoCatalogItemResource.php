<?php

declare(strict_types=1);

namespace Cms\Content\Presentation\Http\Api\V1\Resources\Seo;

use Cms\Content\Application\DTOs\Seo\SeoCatalogItemDTO;
use Cms\Shared\Http\Resources\ApiResource;
use Illuminate\Http\Request;

/**
 * Элемент каталога SEO. Пагинатор несёт сырые строки запроса (курсор строится
 * из их полей сортировки), поэтому в DTO строка превращается здесь.
 *
 * @property object $resource
 */
final class SeoCatalogItemResource extends ApiResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $item = SeoCatalogItemDTO::fromRow((array) $this->resource);

        return [
            'type' => $item->type,
            'entity_id' => $item->entity_id,
            'entity_title' => $item->entity_title,
            'filled' => $item->filled,
            'updated_at' => $item->updated_at,
            'seo' => $item->seo->toArray(),
        ];
    }
}
