<?php

declare(strict_types=1);

namespace Cms\Content\Presentation\Http\Api\V1\Controllers\Admin;

use Cms\Content\Application\Queries\ListProjectSeoQuery;
use Cms\Content\Presentation\Http\Api\V1\Requests\Seo\ListSeoCatalogRequest;
use Cms\Content\Presentation\Http\Api\V1\Resources\Seo\SeoCatalogCursorCollection;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

/** Каталог SEO проекта: строка на сущность контента, включая незаполненные. */
final class SeoCatalogController
{
    #[OA\Get(
        path: '/api/admin/v1/projects/{project}/content/seo',
        operationId: 'content_index_api_admin_v1_projects_project_content_seo',
        tags: ['content'],
        summary: 'GET /api/admin/v1/projects/{project}/content/seo',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'type', in: 'query', required: false, schema: new OA\Schema(type: 'string', enum: ['post', 'page', 'category'])),
            new OA\Parameter(name: 'sort', in: 'query', required: false, schema: new OA\Schema(type: 'string', enum: ['type', 'title', 'updated_at'])),
            new OA\Parameter(name: 'direction', in: 'query', required: false, schema: new OA\Schema(type: 'string', enum: ['asc', 'desc'])),
            new OA\Parameter(name: 'per_page', in: 'query', required: false, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')],
    )]
    public function index(ListSeoCatalogRequest $request, ListProjectSeoQuery $query): JsonResponse
    {
        return (new SeoCatalogCursorCollection($query->handle($request->filter())))->toResponse($request);
    }
}
