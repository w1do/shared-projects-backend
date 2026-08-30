<?php

declare(strict_types=1);

namespace Cms\Content\Application\DTOs\Seo;

use Illuminate\Support\Carbon;
use Spatie\LaravelData\Data;

/** Строка каталога SEO: сущность контента и её SEO-блок. */
final class SeoCatalogItemDTO extends Data
{
    public function __construct(
        public string $type,
        public int $entity_id,
        public string $entity_title,
        public bool $filled,
        public ?string $updated_at,
        public SeoDTO $seo,
    ) {}

    /** @param  array<string, mixed>  $row */
    public static function fromRow(array $row): self
    {
        return new self(
            type: self::text($row, 'type') ?? '',
            entity_id: (int) ($row['entity_id'] ?? 0),
            entity_title: self::entityTitle(self::text($row, 'entity_title') ?? ''),
            filled: ($row['seo_id'] ?? null) !== null,
            updated_at: self::changedAt($row),
            seo: new SeoDTO(
                title: self::text($row, 'title'),
                description: self::text($row, 'description'),
                keywords: self::text($row, 'keywords'),
                canonical: self::text($row, 'canonical'),
                robots: self::text($row, 'robots'),
                og_title: self::text($row, 'og_title'),
                og_description: self::text($row, 'og_description'),
                og_image: self::text($row, 'og_image'),
                twitter_card: self::text($row, 'twitter_card'),
                json_ld: self::jsonLd($row['json_ld'] ?? null),
            ),
        );
    }

    /** @param  array<string, mixed>  $row */
    private static function text(array $row, string $key): ?string
    {
        $value = $row[$key] ?? null;

        return is_string($value) ? $value : null;
    }

    /** @param  array<string, mixed>  $row */
    private static function changedAt(array $row): ?string
    {
        $value = self::text($row, 'entity_updated_at');

        return $value === null ? null : Carbon::parse($value)->toISOString();
    }

    /** Название категории хранится переводимым: в колонке лежит `{"ru": "..."}`. */
    private static function entityTitle(string $stored): string
    {
        $translations = json_decode($stored, true);

        if (! is_array($translations) || $translations === []) {
            return $stored;
        }

        $first = reset($translations);

        return is_string($first) ? $first : $stored;
    }

    /** @return ?array<string, mixed> */
    private static function jsonLd(mixed $stored): ?array
    {
        $decoded = is_string($stored) ? json_decode($stored, true) : $stored;

        return is_array($decoded) ? $decoded : null;
    }
}
