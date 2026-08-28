<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\Commands;

use Cms\Licensing\Domain\Models\Organization;

final readonly class DeleteOrganizationCommand
{
    public function __construct(public Organization $organization) {}
}
