<?php

declare(strict_types=1);

namespace Cms\Licensing\Presentation\Http\Api\V1\Resources\Release;

use Cms\Licensing\Application\DTOs\Release\ReleaseDTO;
use Cms\Licensing\Domain\Models\Release;
use Cms\Shared\Http\Resources\ApiResource;
use Illuminate\Http\Request;

/**
 * Элемент курсорной страницы релизов: пагинатор несёт модели,
 * DTO — на границе ответа.
 *
 * @property Release $resource
 */
final class ReleaseCursorItemResource extends ApiResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return (new ReleaseResource(ReleaseDTO::fromModel($this->resource)))->toArray($request);
    }
}
