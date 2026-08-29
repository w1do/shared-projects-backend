<?php

declare(strict_types=1);

namespace Cms\Research\Presentation\Http\Api\V1\Controllers;

use Cms\Research\Application\Queries\SearchImagesQuery;
use Cms\Research\Presentation\Http\Api\V1\Requests\SearchImagesRequest;
use Cms\Research\Presentation\Http\Api\V1\Resources\ImageResultResource;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

final class ImageSearchController
{
    #[OA\Get(
        path: '/api/admin/v1/projects/{project}/content/images/search',
        operationId: 'content_index_api_admin_v1_projects_project_content_images_search',
        tags: ['content'],
        summary: 'GET /api/admin/v1/projects/{project}/content/images/search',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'query', in: 'query', required: true, schema: new OA\Schema(type: 'string', maxLength: 255)),
            new OA\Parameter(name: 'limit', in: 'query', required: false, schema: new OA\Schema(type: 'integer', maximum: 50, minimum: 1)),
        ],
        responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 403, description: 'Forbidden'), new OA\Response(response: 422, description: 'Validation error')],
    )]
    public function index(SearchImagesRequest $request, SearchImagesQuery $query): JsonResponse
    {
        return ImageResultResource::collection($query->handle($request->searchQuery(), $request->limit()))
            ->toResponse($request);
    }
}
