<?php

declare(strict_types=1);

namespace Cms\Auth\Application\DTOs\User;

use Cms\Auth\Domain\Models\User;
use Spatie\LaravelData\Data;

final class SiteUserDTO extends Data
{
    public function __construct(
        public int $id,
        public ?string $name,
        public string $email,
        public string $project_id,
        public bool $blocked,
    ) {}

    public static function fromModel(User $user): self
    {
        return new self(
            id: $user->id,
            name: $user->name,
            email: $user->email,
            project_id: $user->project_id,
            blocked: $user->isBlocked(),
        );
    }
}
