<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\Handlers;

use Cms\Licensing\Application\Commands\OfflineActivateLicenseCommand;
use Cms\Licensing\Application\DTOs\License\OfflineActivationDTO;
use Cms\Licensing\Application\Exceptions\LicenseRuleViolation;
use Cms\Licensing\Domain\Contracts\LicenseTokenIssuer;
use Cms\Licensing\Domain\Models\License;
use Cms\Licensing\Domain\Models\LicenseInstallation;
use Illuminate\Support\Facades\DB;

/**
 * Офлайн-активация (ТЗ 2.7): установка регистрируется по общим правилам
 * лимита (Д7), токен выпускается с годовым TTL тем же ключом проекта.
 * Ошибки — доменные 422: сценарий операторский, не публичный контракт.
 */
final class OfflineActivateLicenseHandler
{
    public function __construct(private readonly LicenseTokenIssuer $tokens) {}

    public function handle(OfflineActivateLicenseCommand $command): OfflineActivationDTO
    {
        $license = $command->license;

        $installation = DB::transaction(function () use ($license, $command): LicenseInstallation {
            $locked = License::acrossProjects()->whereKey($license->id)->lockForUpdate()->firstOrFail();

            $installation = $locked->installations()->where('install_id', $command->installId)->first();
            if ($installation !== null && $installation->isRevoked()) {
                throw LicenseRuleViolation::installationAlreadyRevoked();
            }

            if ($installation === null) {
                if ($locked->activeInstallations()->count() >= $locked->max_installations) {
                    throw LicenseRuleViolation::installationLimitReached();
                }
                $installation = new LicenseInstallation([
                    'license_id' => $locked->id,
                    'install_id' => $command->installId,
                ]);
            }

            $installation->fill([
                'domain' => $command->domain,
                'app_version' => $command->appVersion,
                'last_seen_at' => now(),
            ])->save();

            return $installation;
        });

        $entitled = $license->raiseEntitledVersion();

        return new OfflineActivationDTO(
            token: $this->tokens->issueOffline($license, $installation, $entitled),
            install_id: $installation->install_id,
            domain: $installation->domain,
        );
    }
}
