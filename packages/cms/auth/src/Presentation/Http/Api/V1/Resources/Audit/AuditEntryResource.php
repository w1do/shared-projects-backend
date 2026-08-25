<?php

declare(strict_types=1);

namespace Cms\Auth\Presentation\Http\Api\V1\Resources\Audit;

use Cms\Auth\Application\DTOs\Audit\AuditEntryDTO;
use Cms\Auth\Domain\Models\AuditLog;
use Cms\Shared\Http\Resources\ApiResource;
use Illuminate\Http\Request;

/** @property AuditLog $resource */
final class AuditEntryResource extends ApiResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return AuditEntryDTO::fromModel($this->resource)->toArray();
    }
}
