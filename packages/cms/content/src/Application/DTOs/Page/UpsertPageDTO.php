<?php

declare(strict_types=1);

namespace Cms\Content\Application\DTOs\Page;

use Spatie\LaravelData\Data;
use Spatie\LaravelData\Optional;

final class UpsertPageDTO extends Data
{
    public function __construct(
        public string $title,
        public string|Optional $slug,
        public string|Optional|null $body,
        public string|Optional $locale,
        public bool|Optional $is_index,
    ) {}
}
