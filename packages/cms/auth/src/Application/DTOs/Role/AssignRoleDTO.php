<?php

declare(strict_types=1);

namespace Cms\Auth\Application\DTOs\Role;

use Spatie\LaravelData\Data;

final class AssignRoleDTO extends Data
{
    public function __construct(public string $role) {}

}
