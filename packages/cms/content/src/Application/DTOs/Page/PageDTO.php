<?php

declare(strict_types=1);

namespace Cms\Content\Application\DTOs\Page;

use Cms\Content\Application\DTOs\Seo\SeoDTO;
use Cms\Content\Domain\Models\Page;
use Spatie\LaravelData\Data;

final class PageDTO extends Data
{
    public function __construct(
        public int $id,
        public string $title,
        public string $slug,
        public ?string $body,
        public string $locale,
        public string $status,
        public ?string $published_at,
        public bool $is_index,
        public ?SeoDTO $seo = null,
    ) {}

    public static function fromModel(Page $page): self
    {
        return new self(
            id: $page->id,
            title: $page->title,
            slug: $page->slug,
            body: $page->body,
            locale: $page->locale,
            status: $page->status->value,
            published_at: $page->published_at?->toIso8601String(),
            is_index: $page->is_index,
            seo: $page->relationLoaded('seo') && $page->seo ? SeoDTO::fromModel($page->seo) : null,
        );
    }
}
