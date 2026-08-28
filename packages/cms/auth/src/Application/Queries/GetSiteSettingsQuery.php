<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Queries;

use Cms\Auth\Application\DTOs\SiteSettings\SiteSettingsDTO;
use Cms\Auth\Domain\Settings\SiteSettings;
use Cms\Shared\Settings\ProjectSettingsProvisioner;

/** Настройки сайта текущего проекта; недостающие свойства достраиваются значениями по умолчанию. */
final class GetSiteSettingsQuery
{
    public function __construct(
        private readonly ProjectSettingsProvisioner $provisioner,
        private readonly SiteSettings $settings,
    ) {}

    public function handle(): SiteSettingsDTO
    {
        $this->provisioner->ensure(SiteSettings::group(), SiteSettings::defaults());

        return SiteSettingsDTO::fromSettings($this->settings);
    }
}
