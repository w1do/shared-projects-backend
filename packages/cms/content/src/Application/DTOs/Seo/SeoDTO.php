<?php

declare(strict_types=1);

namespace Cms\Content\Application\DTOs\Seo;

use Cms\Content\Domain\Models\SeoMeta;
use Spatie\LaravelData\Data;

/**
 * Выходной SEO-блок: все поля + JSON-LD (schema.org).
 *
 * Только чтение — вход описывает `UpsertSeoDTO` (задача 5.3).
 */
final class SeoDTO extends Data
{
    /** @param  ?array<string, mixed>  $json_ld */
    public function __construct(
        public ?string $title = null,
        public ?string $description = null,
        public ?string $keywords = null,
        public ?string $canonical = null,
        public ?string $robots = null,
        public ?string $og_title = null,
        public ?string $og_description = null,
        public ?string $og_image = null,
        public ?string $twitter_card = null,
        public ?array $json_ld = null,
    ) {}

    public static function fromModel(SeoMeta $seo): self
    {
        return new self(
            title: $seo->title,
            description: $seo->description,
            keywords: $seo->keywords,
            canonical: $seo->canonical,
            robots: $seo->robots,
            og_title: $seo->og_title,
            og_description: $seo->og_description,
            og_image: $seo->og_image,
            twitter_card: $seo->twitter_card,
            json_ld: $seo->json_ld === null ? null : (array) $seo->json_ld,
        );
    }
}
