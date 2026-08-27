<?php

declare(strict_types=1);

namespace Cms\Pay\Application\Handlers;

use Cms\Pay\Application\Commands\UpdatePaymentsSettingsCommand;
use Cms\Pay\Application\DTOs\Settings\PaymentsSettingsDTO;
use Cms\Pay\Domain\Settings\PaymentsSettings;
use Cms\Shared\Settings\ProjectSettingsProvisioner;

final class UpdatePaymentsSettingsHandler
{
    public function __construct(
        private readonly ProjectSettingsProvisioner $provisioner,
        private readonly PaymentsSettings $settings,
    ) {}

    public function handle(UpdatePaymentsSettingsCommand $command): PaymentsSettingsDTO
    {
        $this->provisioner->ensure(PaymentsSettings::group(), PaymentsSettings::defaults());

        $this->settings->fill(['provider' => $command->data->provider])->save();

        return PaymentsSettingsDTO::fromSettings($this->settings);
    }
}
