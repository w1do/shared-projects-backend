<?php

declare(strict_types=1);

namespace Cms\Content\Application\DTOs\Seo;

use Spatie\LaravelData\Data;

/**
 * Входной SEO-блок: то, что приходит в `PUT /content/seo/{type}/{id}`.
 *
 * Отделён от выходного `SeoDTO` (задача 5.3): раньше один класс работал и
 * входом, и выходом. Все поля необязательны и по умолчанию `null` —
 * непереданное поле обнуляет запись ровно как прежде (снимок `seo-update-empty`).
 */
final class UpsertSeoDTO extends Data
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
}
