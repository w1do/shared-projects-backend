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

    /** @return array<string, list<mixed>> */
    public static function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['sometimes', 'string', 'max:255', 'alpha_dash'],
            'body' => ['sometimes', 'nullable', 'string'],
            'locale' => ['sometimes', 'string', 'max:10'],
            'is_index' => ['sometimes', 'boolean'],
        ];
    }
}
