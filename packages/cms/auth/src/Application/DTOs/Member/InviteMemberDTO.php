<?php

declare(strict_types=1);

namespace Cms\Auth\Application\DTOs\Member;

use Spatie\LaravelData\Data;

final class InviteMemberDTO extends Data
{
    public function __construct(
        public string $email,
        public string $role,
        public ?string $name = null,
    ) {}

}
