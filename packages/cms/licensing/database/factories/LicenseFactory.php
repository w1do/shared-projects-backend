<?php

declare(strict_types=1);

namespace Cms\Licensing\Database\Factories;

use Cms\Licensing\Domain\Models\License;
use Cms\Licensing\Domain\Models\Organization;
use Cms\Licensing\Domain\Models\Plan;
use Cms\Licensing\Domain\ValueObjects\LicenseKey;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<License> */
final class LicenseFactory extends Factory
{
    protected $model = License::class;

    public function definition(): array
    {
        $key = LicenseKey::fromInput(self::randomKey());

        return [
            'project_id' => 'proj-1',
            'organization_id' => Organization::factory(),
            'plan_id' => Plan::factory(),
            'key_hash' => $key->hash(),
            'key_prefix' => $key->prefix(),
            'edition' => 'enterprise',
            'features' => ['api-access'],
            'entitled_version' => null,
            'updates_until' => now()->addYear()->toDateString(),
            'max_installations' => 1,
            'issued_at' => now(),
        ];
    }

    /** Лицензия с известным тестам plaintext-ключом. */
    public function withKey(string $key): self
    {
        $normalized = LicenseKey::fromInput($key);

        return $this->state([
            'key_hash' => $normalized->hash(),
            'key_prefix' => $normalized->prefix(),
        ]);
    }

    public function revoked(): self
    {
        return $this->state(['revoked_at' => now()]);
    }

    /** Окно обновлений в прошлом: лицензия остаётся активной (Д2). */
    public function updatesExpired(): self
    {
        return $this->state(['updates_until' => now()->subMonth()->toDateString()]);
    }

    private static function randomKey(): string
    {
        $alphabet = LicenseKey::ALPHABET;
        $groups = [];
        for ($g = 0; $g < 4; $g++) {
            $chars = '';
            for ($i = 0; $i < 4; $i++) {
                $chars .= $alphabet[random_int(0, strlen($alphabet) - 1)];
            }
            $groups[] = $chars;
        }

        return 'LIC-'.implode('-', $groups);
    }
}
