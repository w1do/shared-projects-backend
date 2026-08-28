<?php

declare(strict_types=1);

namespace Cms\Pay\Application\Queries;

use Cms\Pay\Application\DTOs\Settings\PaymentsSettingsDTO;
use Cms\Pay\Domain\Settings\PaymentsSettings;
use Cms\Shared\Settings\ProjectSettingsProvisioner;

/** Настройки платежей текущего проекта; недостающие свойства достраиваются. */
final class GetPaymentsSettingsQuery
{
    public function __construct(
        private readonly ProjectSettingsProvisioner $provisioner,
        private readonly PaymentsSettings $settings,
    ) {}

    public function handle(): PaymentsSettingsDTO
    {
        $this->provisioner->ensure(PaymentsSettings::group(), PaymentsSettings::defaults());

        return PaymentsSettingsDTO::fromSettings($this->settings);
    }
}
