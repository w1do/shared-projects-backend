<?php

declare(strict_types=1);

namespace Cms\Licensing\Presentation\Http\Api\V1\Resources\License;

use Cms\Licensing\Application\DTOs\License\LicenseDTO;
use Cms\Licensing\Domain\Models\License;
use Cms\Shared\Http\Resources\ApiResource;
use Illuminate\Http\Request;

/**
 * Элемент курсорной страницы лицензий: пагинатор несёт модели,
 * DTO — на границе ответа.
 *
 * @property License $resource
 */
final class LicenseCursorItemResource extends ApiResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return (new LicenseResource(LicenseDTO::fromModel($this->resource)))->toArray($request);
    }
}
