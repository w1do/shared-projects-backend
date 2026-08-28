<?php

declare(strict_types=1);

namespace Cms\Analytics\Application\Queries;

use Cms\Analytics\Application\DTOs\Settings\AnalyticsSettingsDTO;
use Cms\Analytics\Domain\Settings\AnalyticsSettings;
use Cms\Shared\Settings\ProjectSettingsProvisioner;

/** Конфигурация провайдеров аналитики текущего проекта; недостающие свойства достраиваются. */
final class GetAnalyticsSettingsQuery
{
    public function __construct(
        private readonly ProjectSettingsProvisioner $provisioner,
        private readonly AnalyticsSettings $settings,
    ) {}

    public function handle(): AnalyticsSettingsDTO
    {
        $this->provisioner->ensure(AnalyticsSettings::group(), AnalyticsSettings::defaults());

        return AnalyticsSettingsDTO::fromSettings($this->settings);
    }
}
