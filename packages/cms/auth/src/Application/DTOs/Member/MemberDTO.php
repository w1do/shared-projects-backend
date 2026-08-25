<?php

declare(strict_types=1);

namespace Cms\Auth\Application\DTOs\Member;

use Spatie\LaravelData\Data;

final class MemberDTO extends Data
{
    /** @param list<string> $roles */
    public function __construct(
        public int $id,
        public string $name,
        public string $email,
        public array $roles,
    ) {}
}
