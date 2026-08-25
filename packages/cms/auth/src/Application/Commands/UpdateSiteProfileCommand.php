<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Commands;

use Cms\Auth\Application\DTOs\User\SiteUpdateProfileDTO;
use Cms\Auth\Domain\Models\User;

/** Команда-намерение: данные для UpdateSiteProfileHandler. */
final readonly class UpdateSiteProfileCommand
{
    public function __construct(
        public User $user,
        public SiteUpdateProfileDTO $data,
    ) {}
}
