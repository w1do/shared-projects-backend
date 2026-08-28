<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\Commands;

use Cms\Licensing\Domain\Models\License;

/**
 * Офлайн-активация для закрытых контуров (ТЗ 2.7): оператор передаёт данные
 * файла-запроса установки, в ответ выпускается токен с годовым TTL.
 */
final readonly class OfflineActivateLicenseCommand
{
    public function __construct(
        public License $license,
        public string $installId,
        public string $domain,
        public ?string $appVersion = null,
    ) {}
}
