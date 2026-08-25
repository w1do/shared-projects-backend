<?php

declare(strict_types=1);

namespace Cms\Analytics\Infrastructure\Enrichment;

use Cms\Analytics\Domain\Contracts\UserAgentProfiler;
use Cms\Analytics\Domain\ValueObjects\ClientProfile;

/** Грубый разбор UA: device/os/browser для среза в отчётах. */
final class UserAgentParser implements UserAgentProfiler
{
    public function profile(?string $userAgent): ClientProfile
    {
        $ua = strtolower((string) $userAgent);

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

        return new ClientProfile($device, $os, $browser);
    }
}
