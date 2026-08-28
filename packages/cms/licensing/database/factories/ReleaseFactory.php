<?php

declare(strict_types=1);

namespace Cms\Licensing\Database\Factories;

use Cms\Licensing\Domain\Models\Release;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Release> */
final class ReleaseFactory extends Factory
{
    protected $model = Release::class;

    public function definition(): array
    {
        return [
            'project_id' => 'proj-1',
            'version' => '1.0.0',
            'train' => '1.0',
            'repository' => 'crm/app-1.0',
            'released_at' => now()->subMonth(),
            'is_security' => false,
        ];
    }

    /** Релиз с версией и трейном, выведенным из неё (`1.4.7` → `1.4`). */
    public function version(string $version): self
    {
        $train = implode('.', array_slice(explode('.', $version), 0, 2));

        return $this->state([
            'version' => $version,
            'train' => $train,
            'repository' => "crm/app-{$train}",
        ]);
    }

    public function security(): self
    {
        return $this->state(['is_security' => true]);
    }
}
