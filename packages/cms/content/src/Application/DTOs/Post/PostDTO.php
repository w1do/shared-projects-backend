<?php

declare(strict_types=1);

namespace Cms\Content\Application\DTOs\Post;

use Cms\Content\Application\DTOs\Seo\SeoDTO;
use Cms\Content\Domain\Models\Post;
use Spatie\LaravelData\Data;

final class PostDTO extends Data
{
    /**
     * @param  list<int>  $categories
     * @param  list<string>  $tags
     * @param  list<PostBlockDTO>  $blocks
     */
    public function __construct(
        public int $id,
        public string $title,
        public string $slug,
        public ?string $body,
        public string $locale,
        public ?string $translation_group,
        public string $status,
        public ?string $scheduled_at,
        public ?string $published_at,
        public bool $is_index,
        public array $blocks = [],
        public array $categories = [],
        public array $tags = [],
        public ?SeoDTO $seo = null,
        public ?PostImageDTO $cover = null,
        public ?PostImageDTO $banner = null,
    ) {}

    public static function fromModel(Post $post): self
    {
        return new self(
            id: $post->id,
            title: $post->title,
            slug: $post->slug,
            body: $post->body,
            locale: $post->locale,
            translation_group: $post->translation_group,
            status: $post->status->value,
            scheduled_at: $post->scheduled_at?->toIso8601String(),
            published_at: $post->published_at?->toIso8601String(),
            is_index: $post->is_index,
            blocks: array_map(PostBlockDTO::fromArray(...), $post->blocks ?? []),
            categories: $post->relationLoaded('categories') ? array_values(array_map('intval', $post->categories->pluck('id')->all())) : [],
            tags: $post->relationLoaded('tags') ? array_values(array_map('strval', $post->tags->pluck('name')->all())) : [],
            seo: $post->relationLoaded('seo') && $post->seo ? SeoDTO::fromModel($post->seo) : null,
            // Изображения отдаются всегда: адрес нужен и admin-, и публичному клиенту
            cover: $post->cover ? PostImageDTO::fromModel($post->cover) : null,
            banner: $post->banner ? PostImageDTO::fromModel($post->banner) : null,
        );
    }
}
