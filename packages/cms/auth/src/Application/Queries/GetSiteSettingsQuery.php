<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Queries;

use Cms\Auth\Application\DTOs\SiteSettings\SiteSettingsViewDTO;
use Cms\Auth\Domain\Settings\SiteSettings;
use Cms\Shared\Settings\ProjectSettingsProvisioner;

/** Настройки сайта текущего проекта; недостающие свойства достраиваются значениями по умолчанию. */
final class GetSiteSettingsQuery
{
    public function __construct(
        private readonly ProjectSettingsProvisioner $provisioner,
        private readonly ProjectLocalesQuery $locales,
        private readonly SiteSettings $settings,
    ) {}

    public function handle(): SiteSettingsViewDTO
    {
        $this->provisioner->ensure(SiteSettings::group(), SiteSettings::defaults());

        return SiteSettingsViewDTO::fromSettings($this->settings, $this->locales->handle());
    }
}
