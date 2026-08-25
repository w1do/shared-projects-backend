<?php

declare(strict_types=1);

namespace Cms\Content\Presentation\Http\Api\V1\Controllers\Site;

use Cms\Content\Application\DTOs\Page\PageDTO;
use Cms\Content\Application\DTOs\Post\PostDTO;
use Cms\Content\Application\Queries\FindPublishedPageQuery;
use Cms\Content\Application\Queries\FindPublishedPostQuery;
use Cms\Content\Application\Queries\PublicCategoriesQuery;
use Cms\Content\Application\Queries\PublicPostsQuery;
use Cms\Content\Presentation\Http\Api\V1\Requests\Post\PublicPostsRequest;
use Cms\Content\Presentation\Http\Api\V1\Resources\Category\CategoryResource;
use Cms\Content\Presentation\Http\Api\V1\Resources\Page\PageResource;
use Cms\Content\Presentation\Http\Api\V1\Resources\Post\PostResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

/** Публичное API контента: только published, курсорная пагинация, Redis-кэш. */
final class PublicContentController
{
    #[OA\Get(path: '/api/v1/content/posts', operationId: 'content_posts_api_v1_content_posts', tags: ['content'], summary: 'GET /api/v1/content/posts', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function posts(PublicPostsRequest $request, PublicPostsQuery $query): JsonResponse
    {
        // В кэше лежит готовое тело ответа целиком (вместе с конвертом), поэтому
        // оно отдаётся как есть: повторная упаковка изменила бы форму (И12).
        return new JsonResponse($query->handle($request->filter()));
    }

    #[OA\Get(path: '/api/v1/content/posts/{slug}', operationId: 'content_post_api_v1_content_posts_slug', tags: ['content'], summary: 'GET /api/v1/content/posts/{slug}', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function post(Request $request, string $slug, FindPublishedPostQuery $query): JsonResponse
    {
        $post = $query->handle($slug, $request->query('locale'));

        return (new PostResource(PostDTO::fromModel($post)))->toResponse($request);
    }

    #[OA\Get(path: '/api/v1/content/pages/{slug}', operationId: 'content_page_api_v1_content_pages_slug', tags: ['content'], summary: 'GET /api/v1/content/pages/{slug}', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function page(Request $request, string $slug, FindPublishedPageQuery $query): JsonResponse
    {
        return (new PageResource(PageDTO::fromModel($query->handle($slug))))->toResponse($request);
    }

    #[OA\Get(path: '/api/v1/content/categories', operationId: 'content_categories_api_v1_content_categories', tags: ['content'], summary: 'GET /api/v1/content/categories', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function categories(Request $request, PublicCategoriesQuery $query): JsonResponse
    {
        return CategoryResource::collection($query->handle())->toResponse($request);
    }
}
