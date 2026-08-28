<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\Commands;

/**
 * Ежесуточный refresh установки (публичный контракт ТЗ 1.7): те же поля,
 * что при активации, но установка обязана быть известной и неотозванной.
 */
final readonly class RefreshLicenseCommand
{
    public function __construct(
        public string $key,
        public string $installId,
        public string $domain,
        public string $appVersion,
        public ?string $ip = null,
    ) {}
}
