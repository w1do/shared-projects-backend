<?php

declare(strict_types=1);

namespace Cms\Contracts\Localization;

/** Реализация `entries()` для string-backed enum-ов ключей локализации. */
trait EnumeratesKeys
{
    /** @return array<string, string> ключ → значение по умолчанию */
    public static function entries(): array
    {
        $entries = [];
        foreach (self::cases() as $case) {
            $entries[$case->value] = $case->defaultValue();
        }

        return $entries;
    }
}
