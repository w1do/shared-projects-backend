<?php

declare(strict_types=1);

namespace Cms\Content\Presentation\Http\Api\V1\Controllers\Admin;

use Cms\Content\Application\Commands\UpsertSeoCommand;
use Cms\Content\Application\DTOs\Seo\SeoDTO;
use Cms\Content\Application\Handlers\UpsertSeoHandler;
use Cms\Content\Application\Queries\FindSeoableQuery;
use Cms\Content\Application\Queries\FindSeoQuery;
use Cms\Content\Presentation\Http\Api\V1\Requests\Seo\UpsertSeoRequest;
use Cms\Content\Presentation\Http\Api\V1\Resources\Seo\SeoResource;
use Cms\Shared\Http\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

/** Полиморфное SEO: PUT /content/seo/{type}/{id}, type ∈ post|page|category. */
final class SeoController
{
    #[OA\Put(
        path: '/api/admin/v1/projects/{project}/content/seo/{type}/{id}',
        operationId: 'content_update_api_admin_v1_projects_project_content_seo_type_id',
        tags: ['content'],
        summary: 'PUT /api/admin/v1/projects/{project}/content/seo/{type}/{id}',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'type', in: 'path', required: true, schema: new OA\Schema(type: 'string', enum: ['post', 'page', 'category'])),
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'title', type: 'string', maxLength: 255, nullable: true),
                new OA\Property(property: 'description', type: 'string', maxLength: 500, nullable: true),
                new OA\Property(property: 'keywords', type: 'string', maxLength: 500, nullable: true),
                new OA\Property(property: 'canonical', type: 'string', format: 'uri', maxLength: 255, nullable: true),
                new OA\Property(property: 'robots', type: 'string', maxLength: 64, nullable: true),
                new OA\Property(property: 'og_title', type: 'string', maxLength: 255, nullable: true),
                new OA\Property(property: 'og_description', type: 'string', maxLength: 500, nullable: true),
                new OA\Property(property: 'og_image', type: 'string', maxLength: 255, nullable: true),
                new OA\Property(property: 'twitter_card', type: 'string', maxLength: 32, nullable: true),
                new OA\Property(property: 'json_ld', type: 'object', nullable: true),
            ],
        )),
        responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')],
    )]
    public function update(UpsertSeoRequest $request, string $project, string $type, int $id, FindSeoableQuery $seoable, UpsertSeoHandler $command): JsonResponse
    {
        $seo = $command->handle(new UpsertSeoCommand($seoable->handle($type, $id), $request->upsert()));

        return (new SeoResource(SeoDTO::fromModel($seo)))->toResponse($request);
    }

    #[OA\Get(
        path: '/api/admin/v1/projects/{project}/content/seo/{type}/{id}',
        operationId: 'content_show_api_admin_v1_projects_project_content_seo_type_id',
        tags: ['content'],
        summary: 'GET /api/admin/v1/projects/{project}/content/seo/{type}/{id}',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'type', in: 'path', required: true, schema: new OA\Schema(type: 'string', enum: ['post', 'page', 'category'])),
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')],
    )]
    public function show(Request $request, string $project, string $type, int $id, FindSeoQuery $query): JsonResponse
    {
        $seo = $query->handle($type, $id);

        // Отсутствующий блок отдаётся как `{"data": null}` (снимок `seo-show-null`):
        // JsonResource приводит null к `[]`, поэтому пустая ветка идёт мимо Resource.
        return $seo === null
            ? ApiResponse::data(null)
            : (new SeoResource($seo))->toResponse($request);
    }
}
