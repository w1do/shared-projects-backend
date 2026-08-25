<?php

declare(strict_types=1);

namespace Cms\Analytics\Infrastructure\Support;

/** Простой UA-фильтр ботов: события ботов не попадают в буфер. */
final class BotFilter
{
    private const SIGNATURES = [
        'bot', 'crawler', 'spider', 'slurp', 'curl/', 'wget/', 'python-requests',
        'headless', 'lighthouse', 'pingdom', 'uptime',
    ];

    public static function isBot(?string $userAgent): bool
    {
        if ($userAgent === null || $userAgent === '') {
            return true;
        }

        $ua = strtolower($userAgent);

        foreach (self::SIGNATURES as $signature) {
            if (str_contains($ua, $signature)) {
                return true;
            }
        }

        return false;
    }
}
