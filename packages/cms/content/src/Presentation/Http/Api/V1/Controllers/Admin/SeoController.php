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
    public function update(UpsertSeoRequest $request, string $project, string $type, int $id, FindSeoableQuery $seoable, UpsertSeoHandler $command): JsonResponse
    {
        $seo = $command->handle(new UpsertSeoCommand($seoable->handle($type, $id), $request->upsert()));

        return (new SeoResource(SeoDTO::fromModel($seo)))->toResponse($request);
    }

    #[OA\Get(path: '/api/admin/v1/projects/{project}/content/seo/{type}/{id}', operationId: 'content_show_api_admin_v1_projects_project_content_seo_type_id', tags: ['content'], summary: 'GET /api/admin/v1/projects/{project}/content/seo/{type}/{id}', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
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
