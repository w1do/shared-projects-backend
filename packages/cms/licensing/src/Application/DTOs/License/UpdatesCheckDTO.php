<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\DTOs\License;

use Spatie\LaravelData\Data;

/**
 * Ответ `updates/check` (ТЗ 1.7): `latest_available` показывается всегда —
 * клиент должен видеть, что отстал, даже когда версия ему недоступна.
 */
final class UpdatesCheckDTO extends Data
{
    public function __construct(
        public ?string $latest_entitled,
        public ?string $latest_available,
        public ?string $image,
        public ?string $changelog_url,
        public bool $security_update,
    ) {}
}
