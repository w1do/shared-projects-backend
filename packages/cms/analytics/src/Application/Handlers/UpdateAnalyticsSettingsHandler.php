<?php

declare(strict_types=1);

namespace Cms\Analytics\Application\Handlers;

use Cms\Analytics\Application\Commands\UpdateAnalyticsSettingsCommand;
use Cms\Analytics\Application\DTOs\Settings\AnalyticsSettingsDTO;
use Cms\Analytics\Domain\Settings\AnalyticsSettings;
use Cms\Shared\Settings\ProjectSettingsProvisioner;

final class UpdateAnalyticsSettingsHandler
{
    public function __construct(
        private readonly ProjectSettingsProvisioner $provisioner,
        private readonly AnalyticsSettings $settings,
    ) {}

    public function handle(UpdateAnalyticsSettingsCommand $command): AnalyticsSettingsDTO
    {
        $this->provisioner->ensure(AnalyticsSettings::group(), AnalyticsSettings::defaults());

        $this->settings->fill([
            'yandex_enabled' => $command->data->yandex_enabled,
            'yandex_id' => $command->data->yandex_id,
            'google_enabled' => $command->data->google_enabled,
            'google_id' => $command->data->google_id,
        ])->save();

        return AnalyticsSettingsDTO::fromSettings($this->settings);
    }
}
