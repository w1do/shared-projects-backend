<?php

declare(strict_types=1);

namespace Cms\Shared\Values;

use InvalidArgumentException;

/** Валюта — ISO 4217 alpha-3. */
final readonly class Currency
{
    public function __construct(public string $code)
    {
        if (! preg_match('/^[A-Z]{3}$/', $code)) {
            throw new InvalidArgumentException("Invalid currency code [{$code}].");
        }
    }

    public function equals(self $other): bool
    {
        return $this->code === $other->code;
    }

    public function __toString(): string
    {
        return $this->code;
    }
}
