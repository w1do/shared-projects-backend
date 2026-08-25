<?php

declare(strict_types=1);

namespace Cms\Content\Application\DTOs\Seo;

use Cms\Content\Domain\Models\SeoMeta;
use Spatie\LaravelData\Data;

/** Полный SEO-блок: все поля + JSON-LD (schema.org). */
final class SeoDTO extends Data
{
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

    /** @return array<string, list<mixed>> */
    public static function rules(): array
    {
        return [
            'title' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:500'],
            'keywords' => ['nullable', 'string', 'max:500'],
            'canonical' => ['nullable', 'url', 'max:255'],
            'robots' => ['nullable', 'string', 'max:64'],
            'og_title' => ['nullable', 'string', 'max:255'],
            'og_description' => ['nullable', 'string', 'max:500'],
            'og_image' => ['nullable', 'string', 'max:255'],
            'twitter_card' => ['nullable', 'string', 'max:32'],
            'json_ld' => ['nullable', 'array'], // синтаксис JSON гарантирован типом
        ];
    }

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
