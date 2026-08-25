<?php

declare(strict_types=1);

namespace Cms\Content\Presentation\Http\Api\V1\Controllers\Site;

use Cms\Content\Application\DTOs\Page\PageDTO;
use Cms\Content\Application\DTOs\Post\PostDTO;
use Cms\Content\Application\Queries\CategoryTree;
use Cms\Content\Application\Queries\FindPublishedPage;
use Cms\Content\Application\Queries\FindPublishedPost;
use Cms\Content\Application\Queries\ListPosts;
use Cms\Content\Domain\Models\Post;
use Cms\Content\Infrastructure\Support\ContentCache;
use Cms\Shared\Http\ApiResponse;
use Cms\Shared\Http\ErrorEnvelope;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

/** Публичное API контента: только published, курсорная пагинация, Redis-кэш. */
final class PublicContentController
{
    public function __construct(
        private readonly ContentCache $cache,
        private readonly ProjectContext $context,
    ) {}

    #[OA\Get(path: '/api/v1/content/posts', operationId: 'content_posts_api_v1_content_posts', tags: ['content'], summary: 'GET /api/v1/content/posts', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function posts(Request $request, ListPosts $query): JsonResponse
    {
        $key = 'posts:'.md5(json_encode($request->only(['locale', 'category', 'cursor'])) ?: '');

        $payload = $this->cache->remember($this->context->required(), $key, function () use ($request, $query) {
            $page = $query->handle(
                locale: $request->query('locale'),
                categoryId: $request->query('category') !== null ? (int) $request->query('category') : null,
                publishedOnly: true,
            );

            return ApiResponse::cursorPage($page, fn (Post $post) => PostDTO::fromModel($post))->getData(true);
        });

        return new JsonResponse($payload);
    }

    #[OA\Get(path: '/api/v1/content/posts/{slug}', operationId: 'content_post_api_v1_content_posts_slug', tags: ['content'], summary: 'GET /api/v1/content/posts/{slug}', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function post(Request $request, string $slug, FindPublishedPost $query): JsonResponse
    {
        $post = $query->handle($slug, $request->query('locale'));

        return $post === null ? ErrorEnvelope::notFound() : ApiResponse::data(PostDTO::fromModel($post));
    }

    #[OA\Get(path: '/api/v1/content/pages/{slug}', operationId: 'content_page_api_v1_content_pages_slug', tags: ['content'], summary: 'GET /api/v1/content/pages/{slug}', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function page(string $slug, FindPublishedPage $query): JsonResponse
    {
        $page = $query->handle($slug);

        return $page === null ? ErrorEnvelope::notFound() : ApiResponse::data(PageDTO::fromModel($page));
    }

    #[OA\Get(path: '/api/v1/content/categories', operationId: 'content_categories_api_v1_content_categories', tags: ['content'], summary: 'GET /api/v1/content/categories', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function categories(CategoryTree $query): JsonResponse
    {
        $payload = $this->cache->remember($this->context->required(), 'categories', fn () => $query->handle());

        return ApiResponse::data($payload);
    }
}
