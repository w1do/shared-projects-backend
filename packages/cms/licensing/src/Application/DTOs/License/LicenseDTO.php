<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\DTOs\License;

use Cms\Licensing\Domain\Models\License;
use Spatie\LaravelData\Data;

final class LicenseDTO extends Data
{
    /**
     * @param  array{id: int, name: string}|null  $organization
     * @param  array{id: int, code: string, name: string}|null  $plan
     * @param  list<string>  $features
     */
    public function __construct(
        public string $id,
        public string $key_prefix,
        public string $status,
        public ?array $organization,
        public ?array $plan,
        public string $edition,
        public array $features,
        public ?string $entitled_version,
        public string $updates_until,
        public int $max_installations,
        public int $active_installations,
        public bool $reveal_available,
        public ?string $note,
        public ?string $issued_at,
        public ?string $revoked_at,
    ) {}

    public static function fromModel(License $license): self
    {
        $license->loadMissing(['organization', 'plan']);

        return new self(
            id: $license->id,
            key_prefix: $license->key_prefix,
            status: $license->status()->value,
            organization: $license->organization === null ? null : [
                'id' => $license->organization->id,
                'name' => $license->organization->name,
            ],
            plan: $license->plan === null ? null : [
                'id' => $license->plan->id,
                'code' => $license->plan->code,
                'name' => $license->plan->name,
            ],
            edition: $license->edition,
            features: $license->features,
            entitled_version: $license->entitled_version,
            updates_until: $license->updates_until->toDateString(),
            max_installations: $license->max_installations,
            active_installations: $license->active_installations_count ?? $license->activeInstallations()->count(),
            reveal_available: $license->key_encrypted !== null,
            note: $license->note,
            issued_at: $license->issued_at->toIso8601String(),
            revoked_at: $license->revoked_at?->toIso8601String(),
        );
    }
}
