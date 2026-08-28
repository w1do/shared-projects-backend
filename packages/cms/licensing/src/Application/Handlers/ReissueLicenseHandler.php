<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\Handlers;

use Cms\Licensing\Application\Commands\ReissueLicenseCommand;
use Cms\Licensing\Application\Exceptions\LicenseRuleViolation;
use Cms\Licensing\Domain\Contracts\LicenseSigner;
use Cms\Licensing\Domain\Models\License;
use Illuminate\Support\Carbon;

/**
 * Перевыпуск лицензии с новым `expires_at` (Д15): ключ и запись прежние,
 * payload подписывается заново с актуальным эффективным набором фич.
 * Отозванная лицензия не перевыпускается — отзыв необратим.
 */
final class ReissueLicenseHandler
{
    public function __construct(private readonly LicenseSigner $signer) {}

    public function handle(ReissueLicenseCommand $command): License
    {
        $license = $command->license;

        if ($license->isRevoked()) {
            throw LicenseRuleViolation::alreadyRevoked();
        }

        $license->expires_at = Carbon::parse($command->expiresAt);
        $license->sealWith($this->signer);
        $license->save();

        return $license;
    }
}
