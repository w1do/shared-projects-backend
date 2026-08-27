<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Commands;

use Cms\Auth\Application\DTOs\SiteSettings\SiteSettingsDTO;

/** Команда-намерение: данные для UpdateSiteSettingsHandler. */
final readonly class UpdateSiteSettingsCommand
{
    public function __construct(public SiteSettingsDTO $data) {}
}
