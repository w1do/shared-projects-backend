<?php

declare(strict_types=1);

namespace Cms\Licensing\Presentation\Http\Api\V1\Resources\Plan;

use Cms\Licensing\Application\DTOs\Plan\PlanDTO;
use Cms\Licensing\Domain\Models\Plan;
use Cms\Shared\Http\Resources\ApiResource;
use Illuminate\Http\Request;

/**
 * Элемент курсорной страницы планов: пагинатор несёт модели,
 * DTO — на границе ответа.
 *
 * @property Plan $resource
 */
final class PlanCursorItemResource extends ApiResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return (new PlanResource(PlanDTO::fromModel($this->resource)))->toArray($request);
    }
}
