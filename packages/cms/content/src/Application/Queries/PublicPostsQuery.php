<?php

declare(strict_types=1);

namespace Cms\Content\Application\Queries;

use Cms\Content\Application\DTOs\Post\PostDTO;
use Cms\Content\Application\DTOs\Post\PublicPostsFilterDTO;
use Cms\Content\Domain\Contracts\ContentCache;
use Cms\Shared\Tenant\ProjectContext;

/**
 * Публичный список постов с кэшированием готового тела ответа.
 *
 * Кэш-оркестрация (ключ, remember, форма значения) переехала сюда из
 * `PublicContentController` (задача 5.5). Форма закэшированного значения —
 * прежняя: `{data: [...], meta: {per_page, next_cursor, prev_cursor}}`,
 * поэтому префикс ключа не меняется (Safety Protocol, И12; guard 0.13).
 */
final class PublicPostsQuery
{
    public function __construct(
        private readonly ContentCache $cache,
        private readonly ProjectContext $context,
        private readonly ListPostsQuery $posts,
    ) {}

    /** @return array<string, mixed> */
    public function handle(PublicPostsFilterDTO $filter): array
    {
        $key = 'posts:'.md5(json_encode($filter->cacheKeyParts) ?: '');

        /** @var array<string, mixed> */
        return $this->cache->remember($this->context->required(), $key, function () use ($filter): array {
            $page = $this->posts->handle(
                locale: $filter->locale,
                categoryId: $filter->categoryId,
                publishedOnly: true,
            );

            return [
                'data' => array_map(
                    static fn (PostDTO $post): array => $post->toArray(),
                    $page->items(),
                ),
                'meta' => [
                    'per_page' => $page->perPage(),
                    'next_cursor' => $page->nextCursor()?->encode(),
                    'prev_cursor' => $page->previousCursor()?->encode(),
                ],
            ];
        });
    }
}
