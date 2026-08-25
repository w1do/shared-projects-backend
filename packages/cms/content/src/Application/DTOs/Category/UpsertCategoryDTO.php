<?php

declare(strict_types=1);

namespace Cms\Content\Application\DTOs\Category;

use Spatie\LaravelData\Data;
use Spatie\LaravelData\Optional;

final class UpsertCategoryDTO extends Data
{
    /** @param string|array<string, string> $name строка — локаль по умолчанию, массив — набор по локалям */
    public function __construct(
        public string|array $name,
        public string|Optional $slug,
        public int|Optional|null $parent_id,
        public bool|Optional $is_index,
    ) {}
}
