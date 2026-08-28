<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\Handlers;

use Cms\Licensing\Application\Commands\IssueLicenseCommand;
use Cms\Licensing\Domain\Contracts\LicenseKeyGenerator;
use Cms\Licensing\Domain\Contracts\LicenseSigner;
use Cms\Licensing\Domain\Models\License;
use Illuminate\Support\Carbon;

/**
 * Выпуск лицензии (Д3/Д8): uuid и активационный ключ генерируются до подписи —
 * оба входят в payload; эффективный набор фич фиксируется на момент выпуска.
 */
final class IssueLicenseHandler
{
    public function __construct(
        private readonly LicenseKeyGenerator $keys,
        private readonly LicenseSigner $signer,
    ) {}

    public function handle(IssueLicenseCommand $command): License
    {
        $license = new License([
            'organization_id' => $command->organization->id,
            'plan_id' => $command->plan->id,
            'key' => $this->keys->generate(),
            'issued_at' => now(),
            'expires_at' => Carbon::parse($command->expiresAt),
        ]);
        $license->id = $license->newUniqueId();
        // до подписи: ключ пары — проектный, autofill сработал бы позже (saving)
        $license->project_id = $command->organization->project_id;

        $license->setRelation('organization', $command->organization);
        $license->setRelation('plan', $command->plan);
        $license->sealWith($this->signer);
        $license->save();

        return $license;
    }
}
