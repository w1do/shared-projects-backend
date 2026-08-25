<?php

declare(strict_types=1);

namespace Cms\Localization\Presentation\Http\Api\V1\Resources;

use Cms\Localization\Application\DTOs\Translation\TranslationDTO;
use Cms\Localization\Domain\Models\Translation;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @property Translation $resource */
final class TranslationResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return TranslationDTO::fromModel($this->resource)->toArray();
    }
}
