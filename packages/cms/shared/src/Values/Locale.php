<?php

declare(strict_types=1);

namespace Cms\Shared\Values;

use InvalidArgumentException;

/** Локаль вида "ru" или "en-US". */
final readonly class Locale
{
    public function __construct(public string $code)
    {
        if (! preg_match('/^[a-z]{2}(-[A-Z]{2})?$/', $code)) {
            throw new InvalidArgumentException("Invalid locale [{$code}].");
        }
    }

    public function __toString(): string
    {
        return $this->code;
    }
}
