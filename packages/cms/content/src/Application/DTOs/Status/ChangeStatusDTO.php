<?php

declare(strict_types=1);

namespace Cms\Content\Application\DTOs\Status;

use Spatie\LaravelData\Data;
use Spatie\LaravelData\Optional;

final class ChangeStatusDTO extends Data
{
    public function __construct(
        public string $status,
        public string|Optional|null $scheduled_at,
    ) {}
}
