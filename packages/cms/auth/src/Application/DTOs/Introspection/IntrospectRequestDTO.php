<?php

declare(strict_types=1);

namespace Cms\Auth\Application\DTOs\Introspection;

use Spatie\LaravelData\Data;
use Spatie\LaravelData\Optional;

final class IntrospectRequestDTO extends Data
{
    public function __construct(
        public string|Optional $token,
        public string|Optional $api_key,
        public string|Optional $project,
    ) {}
}
