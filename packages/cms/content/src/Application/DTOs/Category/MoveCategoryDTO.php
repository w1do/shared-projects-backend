<?php

declare(strict_types=1);

namespace Cms\Content\Application\DTOs\Category;

use Spatie\LaravelData\Data;
use Spatie\LaravelData\Optional;

final class MoveCategoryDTO extends Data
{
    public function __construct(
        public int|Optional|null $parent_id,
        public int|Optional $position,
    ) {}

    /** @return array<string, list<mixed>> */
    public static function rules(): array
    {
        return [
            'parent_id' => ['sometimes', 'nullable', 'integer'],
            'position' => ['sometimes', 'integer', 'min:0'],
        ];
    }
}
