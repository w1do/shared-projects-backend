<?php

declare(strict_types=1);

namespace Cms\Content\Application\DTOs\Post;

use Spatie\LaravelData\Data;
use Spatie\LaravelData\Optional;

final class UpsertPostDTO extends Data
{
    /** @param list<int>|Optional $categories */
    public function __construct(
        public string $title,
        public string|Optional $slug,
        public string|Optional|null $body,
        public string|Optional $locale,
        public string|Optional|null $translation_group,
        public array|Optional $categories,
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
            'translation_group' => ['sometimes', 'nullable', 'string', 'max:64'],
            'categories' => ['sometimes', 'array'],
            'categories.*' => ['integer'],
            'is_index' => ['sometimes', 'boolean'],
        ];
    }
}
