<?php

declare(strict_types=1);

namespace Cms\Content\Application\DTOs\Post;

use Spatie\LaravelData\Data;

/**
 * Фильтр публичного списка постов.
 *
 * `cacheKeyParts` — подмножество параметров запроса, которым различаются ответы
 * (`locale`, `category`, `cursor` ровно в этом порядке и только присутствующие).
 * Оно же участвует в ключе кэша, поэтому состав и порядок менять нельзя:
 * ключ `content:{project}:v{version}:posts:{md5}` переживает деплой
 * (Safety Protocol, И12; guard-тест 0.13 фиксирует конкретный md5).
 */
final class PublicPostsFilterDTO extends Data
{
    /** @param  array<string, mixed>  $cacheKeyParts */
    public function __construct(
        public ?string $locale,
        public ?int $categoryId,
        public array $cacheKeyParts,
    ) {}
}
