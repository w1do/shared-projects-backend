<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Handlers;

use Cms\Auth\Application\Commands\UpdateSiteSettingsCommand;
use Cms\Auth\Application\DTOs\SiteSettings\SiteSettingsViewDTO;
use Cms\Auth\Application\Queries\ProjectLocalesQuery;
use Cms\Auth\Domain\Settings\SiteSettings;
use Cms\Shared\Settings\ProjectSettingsProvisioner;

final class UpdateSiteSettingsHandler
{
    public function __construct(
        private readonly ProjectSettingsProvisioner $provisioner,
        private readonly ProjectLocalesQuery $locales,
        private readonly SiteSettings $settings,
    ) {}

    public function handle(UpdateSiteSettingsCommand $command): SiteSettingsViewDTO
    {
        $this->provisioner->ensure(SiteSettings::group(), SiteSettings::defaults());

        $this->settings->fill([
            'project_type' => $command->data->project_type,
            'timezone' => $command->data->timezone,
            'language' => $command->data->language,
            'currency_default' => $command->data->currency_default,
            'currencies' => $command->data->currencies,
        ])->save();

        return SiteSettingsViewDTO::fromSettings($this->settings, $this->locales->handle());
    }
}
