<?php

declare(strict_types=1);

namespace Cms\Auth\Application\DTOs\Service;

use Spatie\LaravelData\Data;

/** Состояние сервиса на проекте: включён или нет. */
final class ServiceStatusDTO extends Data
{
    public function __construct(
        public string $service,
        public bool $enabled,
    ) {}
}
