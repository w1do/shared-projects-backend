<?php

declare(strict_types=1);

namespace Cms\Analytics\Infrastructure\Support;

/** Грубый разбор UA: device/os/browser для среза в отчётах. */
final class UserAgentParser
{
    /** @return array{device: string, os: string, browser: string} */
    public static function parse(?string $ua): array
    {
        $ua = strtolower((string) $ua);

        $device = str_contains($ua, 'mobile') || str_contains($ua, 'android') || str_contains($ua, 'iphone')
            ? 'mobile' : 'desktop';

        $os = match (true) {
            str_contains($ua, 'windows') => 'windows',
            str_contains($ua, 'mac os') => 'macos',
            str_contains($ua, 'android') => 'android',
            str_contains($ua, 'iphone'), str_contains($ua, 'ios') => 'ios',
            str_contains($ua, 'linux') => 'linux',
            default => 'other',
        };

        $browser = match (true) {
            str_contains($ua, 'edg/') => 'edge',
            str_contains($ua, 'chrome') => 'chrome',
            str_contains($ua, 'safari') => 'safari',
            str_contains($ua, 'firefox') => 'firefox',
            default => 'other',
        };

        return ['device' => $device, 'os' => $os, 'browser' => $browser];
    }
}
