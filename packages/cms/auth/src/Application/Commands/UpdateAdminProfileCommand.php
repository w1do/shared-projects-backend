<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Commands;

use Cms\Auth\Application\DTOs\Auth\UpdateProfileDTO;
use Cms\Auth\Domain\Models\Admin;

/** Команда-намерение: данные для UpdateAdminProfileHandler. */
final readonly class UpdateAdminProfileCommand
{
    public function __construct(
        public Admin $admin,
        public UpdateProfileDTO $data,
    ) {}
}
