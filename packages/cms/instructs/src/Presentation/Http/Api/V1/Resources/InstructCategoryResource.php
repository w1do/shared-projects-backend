<?php

declare(strict_types=1);

namespace Cms\Instructs\Presentation\Http\Api\V1\Resources;

use Cms\Instructs\Domain\Enums\InstructCategory;
use Cms\Shared\Http\Resources\ApiResource;
use Illuminate\Http\Request;

/** @property InstructCategory $resource */
final class InstructCategoryResource extends ApiResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'value' => $this->resource->value,
            'label' => $this->resource->label(),
        ];
    }
}
