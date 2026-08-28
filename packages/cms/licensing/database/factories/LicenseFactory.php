<?php

declare(strict_types=1);

namespace Cms\Licensing\Database\Factories;

use Cms\Licensing\Domain\Models\License;
use Cms\Licensing\Domain\Models\Organization;
use Cms\Licensing\Domain\Models\Plan;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<License> */
final class LicenseFactory extends Factory
{
    protected $model = License::class;

    public function definition(): array
    {
        return [
            'project_id' => 'proj-1',
            'organization_id' => Organization::factory(),
            'plan_id' => Plan::factory(),
            'key' => 'LIC-'.implode('-', str_split(strtoupper((string) Str::random(25)), 5)),
            'signed_payload' => base64_encode('{}'),
            'issued_at' => now(),
            'expires_at' => now()->addYear(),
        ];
    }

    public function revoked(): self
    {
        return $this->state(['revoked_at' => now()]);
    }

    public function expired(): self
    {
        return $this->state(['expires_at' => now()->subDay()]);
    }
}
