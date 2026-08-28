<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\Commands;

use Cms\Licensing\Application\DTOs\Organization\UpsertOrganizationDTO;
use Cms\Licensing\Domain\Models\Organization;

final readonly class UpsertOrganizationCommand
{
    public function __construct(
        public UpsertOrganizationDTO $data,
        public ?Organization $organization = null,
    ) {}
}
