<?php

declare(strict_types=1);

namespace Cms\Auth\Application\DTOs\Permission;

use Spatie\LaravelData\Data;

/** Право каталога проекта: ключ, подпись, группа и сервис, к которому оно относится. */
final class PermissionCatalogEntryDTO extends Data
{
    public function __construct(
        public string $key,
        public string $label,
        public ?string $group,
        public string $service,
    ) {}
}
