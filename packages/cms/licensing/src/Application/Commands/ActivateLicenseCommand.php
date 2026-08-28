<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\Commands;

/**
 * Активация установки по активационному ключу (публичный контракт ТЗ 1.7):
 * лицензия резолвится по хэшу ключа, `install_id` генерируется поставкой.
 */
final readonly class ActivateLicenseCommand
{
    public function __construct(
        public string $key,
        public string $installId,
        public string $domain,
        public string $appVersion,
        public ?string $ip = null,
    ) {}
}
