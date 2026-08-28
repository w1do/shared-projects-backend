<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\Queries;

use Cms\Licensing\Domain\Models\Organization;

/**
 * Организация проекта по id. Tenant-изоляция — глобальным скоупом
 * `BelongsToProject`: чужая организация не находится и даёт 404.
 */
final class FindOrganizationQuery
{
    public function handle(int $organizationId): Organization
    {
        return Organization::query()->findOrFail($organizationId);
    }
}
