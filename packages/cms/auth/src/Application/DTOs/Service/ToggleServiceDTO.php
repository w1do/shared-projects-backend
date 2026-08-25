<?php

declare(strict_types=1);

namespace Cms\Auth\Application\DTOs\Service;

use Spatie\LaravelData\Data;

final class ToggleServiceDTO extends Data
{
    public function __construct(public bool $enabled) {}

}
