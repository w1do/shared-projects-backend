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
     */
    public function __construct(
        public string $id,
        public string $key,
        public string $status,
        public ?array $organization,
        public ?array $plan,
        public ?string $issued_at,
        public ?string $expires_at,
        public ?string $revoked_at,
    ) {}

    public static function fromModel(License $license): self
    {
        $license->loadMissing(['organization', 'plan']);

        return new self(
            id: $license->id,
            key: $license->key,
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
            issued_at: $license->issued_at->toIso8601String(),
            expires_at: $license->expires_at->toIso8601String(),
            revoked_at: $license->revoked_at?->toIso8601String(),
        );
    }
}
