<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\DTOs\License;

use Spatie\LaravelData\Data;

/** Результат офлайн-активации (ТЗ 2.7): годовой токен для файла клиенту. */
final class OfflineActivationDTO extends Data
{
    public function __construct(
        public string $token,
        public string $install_id,
        public string $domain,
    ) {}
}
