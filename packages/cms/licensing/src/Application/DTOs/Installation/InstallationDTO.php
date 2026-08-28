<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\DTOs\Installation;

use Cms\Licensing\Domain\Models\LicenseInstallation;
use Spatie\LaravelData\Data;

final class InstallationDTO extends Data
{
    public function __construct(
        public int $id,
        public string $install_id,
        public string $domain,
        public ?string $app_version,
        public ?string $last_ip,
        public ?string $last_seen_at,
        public string $status,
        public ?string $revoked_at,
    ) {}

    public static function fromModel(LicenseInstallation $installation): self
    {
        return new self(
            id: $installation->id,
            install_id: $installation->install_id,
            domain: $installation->domain,
            app_version: $installation->app_version,
            last_ip: $installation->last_ip,
            last_seen_at: $installation->last_seen_at?->toIso8601String(),
            status: $installation->isRevoked() ? 'revoked' : 'active',
            revoked_at: $installation->revoked_at?->toIso8601String(),
        );
    }
}
