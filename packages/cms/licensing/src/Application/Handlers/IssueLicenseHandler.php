<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\Handlers;

use Cms\Licensing\Application\Commands\IssueLicenseCommand;
use Cms\Licensing\Application\DTOs\License\IssuedLicenseDTO;
use Cms\Licensing\Domain\Contracts\LicenseKeyGenerator;
use Cms\Licensing\Domain\Models\License;
use Cms\Licensing\Domain\Models\Release;
use Cms\Licensing\Domain\ValueObjects\LicenseKey;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Crypt;

/**
 * Выпуск perpetual-лицензии (Д2/Д3): entitlements (edition, снимок фич,
 * entitled_version по каталогу релизов) фиксируются в момент выпуска;
 * plaintext-ключ существует только в результате — в БД хэш и префикс.
 */
final class IssueLicenseHandler
{
    public function __construct(private readonly LicenseKeyGenerator $keys) {}

    public function handle(IssueLicenseCommand $command): IssuedLicenseDTO
    {
        $key = LicenseKey::fromInput($this->keys->generate());
        $projectId = $command->organization->project_id;

        $license = new License([
            'organization_id' => $command->organization->id,
            'plan_id' => $command->plan->id,
            'key_hash' => $key->hash(),
            'key_prefix' => $key->prefix(),
            'key_encrypted' => $command->encryptKey ? Crypt::encryptString($key->normalized) : null,
            'edition' => $command->plan->code,
            'features' => $command->plan->effectiveFeatureCodes($command->organization->id),
            'entitled_version' => $command->entitledVersion ?? Release::latestVersionFor($projectId, now()),
            'updates_until' => Carbon::parse($command->updatesUntil)->toDateString(),
            'max_installations' => $command->maxInstallations,
            'note' => $command->note,
            'issued_at' => now(),
        ]);
        // до сохранения явно: листенеры подписки работают и без проектного контекста
        $license->project_id = $projectId;
        $license->save();

        return IssuedLicenseDTO::fromModel($license, $key->normalized);
    }
}
