<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\Handlers;

use Cms\Licensing\Application\Commands\RefreshLicenseCommand;
use Cms\Licensing\Application\DTOs\License\ActivationResultDTO;
use Cms\Licensing\Application\Exceptions\LicenseActivationError;
use Cms\Licensing\Domain\Contracts\LicenseTokenIssuer;
use Cms\Licensing\Domain\Models\License;
use Illuminate\Contracts\Config\Repository as Config;

/**
 * Ежесуточный refresh (ТЗ 2.3): обновляет телеметрию известной установки
 * и выдаёт свежий токен с пересчитанной `entitled_version`; отозванная
 * лицензия получает подписанный revoked-токен на 200 (Д6).
 */
final class RefreshLicenseHandler
{
    public function __construct(
        private readonly LicenseTokenIssuer $tokens,
        private readonly Config $config,
    ) {}

    public function handle(RefreshLicenseCommand $command): ActivationResultDTO
    {
        $license = License::findByKey($command->key) ?? throw LicenseActivationError::licenseNotFound();

        $installation = $license->activeInstallations()
            ->where('install_id', $command->installId)
            ->first() ?? throw LicenseActivationError::unknownInstallation();

        $installation->fill([
            'domain' => $command->domain,
            'app_version' => $command->appVersion,
            'last_ip' => $command->ip,
            'last_seen_at' => now(),
        ])->save();

        $entitled = $license->raiseEntitledVersion();

        return new ActivationResultDTO(
            token: $this->tokens->issue($license, $installation, $entitled),
            state: $license->activationState(),
            refresh_in: (int) $this->config->get('cms-licensing.refresh_in_seconds'),
        );
    }
}
