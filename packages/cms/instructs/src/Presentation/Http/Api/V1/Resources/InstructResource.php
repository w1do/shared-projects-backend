<?php

declare(strict_types=1);

namespace Cms\Instructs\Presentation\Http\Api\V1\Resources;

use Cms\Instructs\Application\DTOs\Instruct\InstructDTO;
use Cms\Shared\Http\Resources\ApiResource;
use Illuminate\Http\Request;

/** @property InstructDTO $resource */
final class InstructResource extends ApiResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return $this->resource->toArray();
    }
}
