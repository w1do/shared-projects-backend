<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\DTOs\Organization;

use Spatie\LaravelData\Data;
use Spatie\LaravelData\Optional;

/**
 * Анкета организации. Optional-семантика (И1): «поле не передано» ≠ «поле = null» —
 * DTO собирается ТОЛЬКО из validated().
 */
final class UpsertOrganizationDTO extends Data
{
    public function __construct(
        public string $name,
        public string $contact_first_name,
        public string $contact_last_name,
        public string $email,
        public string|Optional|null $phone,
        public string|Optional|null $telegram,
        public string|Optional|null $activity,
        public int|Optional|null $employees_count,
        public string|Optional|null $usage_purpose,
    ) {}
}
