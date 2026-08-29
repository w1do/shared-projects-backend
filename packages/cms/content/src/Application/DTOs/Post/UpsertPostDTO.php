<?php

declare(strict_types=1);

namespace Cms\Content\Application\DTOs\Post;

use Spatie\LaravelData\Data;
use Spatie\LaravelData\Optional;

final class UpsertPostDTO extends Data
{
    /**
     * @param  list<int>|Optional  $categories
     * @param  list<string>|Optional  $tags
     */
    public function __construct(
        public string $title,
        public string|Optional $slug,
        public string|Optional|null $body,
        public string|Optional $locale,
        public string|Optional|null $translation_group,
        public array|Optional $categories,
        public bool|Optional $is_index,
        public array|Optional $tags = new Optional,
        public int|Optional|null $cover_media_id = new Optional,
        public int|Optional|null $banner_media_id = new Optional,
    ) {}
}
