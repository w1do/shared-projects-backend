<?php

declare(strict_types=1);

namespace Cms\Auth\Application\DTOs\ApiKey;

use Cms\Auth\Domain\Models\ProjectApiKey;
use Spatie\LaravelData\Data;

final class ApiKeyDTO extends Data
{
    /** @param list<string> $scopes */
    public function __construct(
        public string $id,
        public string $type,
        public string $prefix,
        public array $scopes,
        public ?string $last_used_at,
        public ?string $revoked_at,
        public ?string $key = null, // полный ключ — только один раз, при выдаче
    ) {}

    public static function fromModel(ProjectApiKey $key): self
    {
        return new self(
            id: $key->id,
            type: $key->type,
            prefix: $key->prefix,
            scopes: $key->scopes ?? [],
            last_used_at: $key->last_used_at?->toIso8601String(),
            revoked_at: $key->revoked_at?->toIso8601String(),
        );
    }

    public static function issued(ProjectApiKey $key, string $plain): self
    {
        return new self(
            id: $key->id,
            type: $key->type,
            prefix: $key->prefix,
            scopes: $key->scopes ?? [],
            last_used_at: null,
            revoked_at: null,
            key: $plain,
        );
    }
}
