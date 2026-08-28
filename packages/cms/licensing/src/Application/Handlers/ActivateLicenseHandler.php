<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\Handlers;

use Cms\Licensing\Application\Commands\ActivateLicenseCommand;
use Cms\Licensing\Application\DTOs\License\ActivationResultDTO;
use Cms\Licensing\Application\Exceptions\LicenseActivationError;
use Cms\Licensing\Domain\Contracts\LicenseTokenIssuer;
use Cms\Licensing\Domain\Models\License;
use Cms\Licensing\Domain\Models\LicenseInstallation;
use Illuminate\Contracts\Config\Repository as Config;
use Illuminate\Support\Facades\DB;

/**
 * Активация установки (ТЗ 2.3): слот лимита выделяется под `lockForUpdate`
 * лицензии — гонка параллельных активаций не пробивает лимит (Д7). Токен
 * выдаётся всегда, включая отозванную лицензию — со `status: revoked` (Д6).
 */
final class ActivateLicenseHandler
{
    public function __construct(
        private readonly LicenseTokenIssuer $tokens,
        private readonly Config $config,
    ) {}

    public function handle(ActivateLicenseCommand $command): ActivationResultDTO
    {
        $license = License::findByKey($command->key) ?? throw LicenseActivationError::licenseNotFound();

        $installation = DB::transaction(function () use ($license, $command): LicenseInstallation {
            $locked = License::acrossProjects()->whereKey($license->id)->lockForUpdate()->firstOrFail();

            $installation = $locked->installations()->where('install_id', $command->installId)->first();
            if ($installation !== null && $installation->isRevoked()) {
                throw LicenseActivationError::unknownInstallation();
            }

            if ($installation === null) {
                if ($locked->activeInstallations()->count() >= $locked->max_installations) {
                    throw LicenseActivationError::installationLimitReached();
                }
                $installation = new LicenseInstallation([
                    'license_id' => $locked->id,
                    'install_id' => $command->installId,
                ]);
            }

            $installation->fill([
                'domain' => $command->domain,
                'app_version' => $command->appVersion,
                'last_ip' => $command->ip,
                'last_seen_at' => now(),
            ])->save();

            return $installation;
        });

        $entitled = $license->raiseEntitledVersion();

        return new ActivationResultDTO(
            token: $this->tokens->issue($license, $installation, $entitled),
            state: $license->activationState(),
            refresh_in: (int) $this->config->get('cms-licensing.refresh_in_seconds'),
        );
    }
}
