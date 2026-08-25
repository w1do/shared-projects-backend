<?php

declare(strict_types=1);

namespace Cms\Analytics\Domain\Contracts;

use Cms\Analytics\Domain\ValueObjects\ClientProfile;

/** Порт разбора User-Agent: device/os/browser для срезов в отчётах. */
interface UserAgentProfiler
{
    public function profile(?string $userAgent): ClientProfile;
}
