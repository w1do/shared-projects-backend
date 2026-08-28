<?php

declare(strict_types=1);

namespace Cms\Licensing\Database\Factories;

use Cms\Licensing\Domain\Models\License;
use Cms\Licensing\Domain\Models\LicenseInstallation;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<LicenseInstallation> */
final class LicenseInstallationFactory extends Factory
{
    protected $model = LicenseInstallation::class;

    public function definition(): array
    {
        return [
            'license_id' => License::factory(),
            'install_id' => bin2hex(random_bytes(32)),
            'domain' => 'crm.client.example',
            'app_version' => '1.0.0',
            'last_ip' => '127.0.0.1',
            'last_seen_at' => now(),
        ];
    }

    public function revoked(): self
    {
        return $this->state(['revoked_at' => now()]);
    }
}
