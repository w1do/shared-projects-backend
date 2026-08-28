<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\DTOs\Organization;

use Cms\Licensing\Domain\Models\Organization;
use Spatie\LaravelData\Data;

final class OrganizationDTO extends Data
{
    public function __construct(
        public int $id,
        public string $name,
        public string $contact_first_name,
        public string $contact_last_name,
        public ?string $phone,
        public string $email,
        public ?string $telegram,
        public ?string $activity,
        public ?int $employees_count,
        public ?string $usage_purpose,
        public ?string $created_at,
    ) {}

    public static function fromModel(Organization $organization): self
    {
        return new self(
            id: $organization->id,
            name: $organization->name,
            contact_first_name: $organization->contact_first_name,
            contact_last_name: $organization->contact_last_name,
            phone: $organization->phone,
            email: $organization->email,
            telegram: $organization->telegram,
            activity: $organization->activity,
            employees_count: $organization->employees_count,
            usage_purpose: $organization->usage_purpose,
            created_at: $organization->created_at?->toIso8601String(),
        );
    }
}
