<?php

declare(strict_types=1);

namespace Cms\Licensing\Presentation\Http\Api\V1\Resources\Organization;

use Cms\Licensing\Application\DTOs\Organization\OrganizationDTO;
use Cms\Licensing\Domain\Models\Organization;
use Cms\Shared\Http\Resources\ApiResource;
use Illuminate\Http\Request;

/**
 * Элемент курсорной страницы организаций: пагинатор несёт модели
 * (курсор строится из атрибутов), DTO — на границе ответа.
 *
 * @property Organization $resource
 */
final class OrganizationCursorItemResource extends ApiResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return (new OrganizationResource(OrganizationDTO::fromModel($this->resource)))->toArray($request);
    }
}
