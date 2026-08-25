<?php

declare(strict_types=1);

namespace Cms\Shared\Http;

use Illuminate\Support\Str;

/**
 * Trace id текущего запроса. Регистрируется как scoped —
 * под Octane не переживает запрос и не течёт между проектами.
 */
final class TraceId
{
    private ?string $value = null;

    public function set(string $value): void
    {
        $this->value = $value;
    }

    public function current(): string
    {
        return $this->value ??= (string) Str::ulid();
    }
}
