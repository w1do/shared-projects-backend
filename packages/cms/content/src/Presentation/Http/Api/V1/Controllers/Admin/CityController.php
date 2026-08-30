<?php

declare(strict_types=1);

namespace Cms\Content\Presentation\Http\Api\V1\Controllers\Admin;

use Cms\Content\Application\Actions\ApplyStarterCitiesAction;
use Cms\Content\Application\Commands\SetCityEnabledCommand;
use Cms\Content\Application\Commands\UpsertSeoCommand;
use Cms\Content\Application\DTOs\City\CityBulkResultDTO;
use Cms\Content\Application\DTOs\Seo\SeoDTO;
use Cms\Content\Application\Handlers\EnableAllCitiesHandler;
use Cms\Content\Application\Handlers\ResetCitiesToStarterHandler;
use Cms\Content\Application\Handlers\SetCityEnabledHandler;
use Cms\Content\Application\Handlers\UpsertSeoHandler;
use Cms\Content\Application\Queries\FindProjectCityQuery;
use Cms\Content\Application\Queries\FindSeoableQuery;
use Cms\Content\Application\Queries\FindSeoQuery;
use Cms\Content\Application\Queries\ListProjectCitiesQuery;
use Cms\Content\Application\Queries\ListRegionsQuery;
use Cms\Content\Domain\Enums\SeoableType;
use Cms\Content\Presentation\Http\Api\V1\Requests\City\ListCitiesRequest;
use Cms\Content\Presentation\Http\Api\V1\Requests\City\SetCityEnabledRequest;
use Cms\Content\Presentation\Http\Api\V1\Requests\Seo\UpsertSeoRequest;
use Cms\Content\Presentation\Http\Api\V1\Resources\City\CityBulkResultResource;
use Cms\Content\Presentation\Http\Api\V1\Resources\City\CityCursorCollection;
use Cms\Content\Presentation\Http\Api\V1\Resources\City\CityResource;
use Cms\Content\Presentation\Http\Api\V1\Resources\City\RegionResource;
use Cms\Content\Presentation\Http\Api\V1\Resources\Seo\SeoResource;
use Cms\Shared\Http\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

/** Города проекта: состав справочника с включённостью текущего проекта. */
final class CityController
{
    #[OA\Get(
        path: '/api/admin/v1/projects/{project}/content/cities',
        operationId: 'content_index_api_admin_v1_projects_project_content_cities',
        tags: ['content'],
        summary: 'GET /api/admin/v1/projects/{project}/content/cities',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'search', in: 'query', required: false, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'region_id', in: 'query', required: false, schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'enabled', in: 'query', required: false, schema: new OA\Schema(type: 'boolean')),
            new OA\Parameter(name: 'sort', in: 'query', required: false, schema: new OA\Schema(type: 'string', enum: ['population', 'name'])),
            new OA\Parameter(name: 'direction', in: 'query', required: false, schema: new OA\Schema(type: 'string', enum: ['asc', 'desc'])),
            new OA\Parameter(name: 'per_page', in: 'query', required: false, schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'cursor', in: 'query', required: false, schema: new OA\Schema(type: 'string')),
        ],
        responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')],
    )]
    public function index(
        ListCitiesRequest $request,
        ApplyStarterCitiesAction $starter,
        ListProjectCitiesQuery $query,
    ): JsonResponse {
        $starter->handle();

        return (new CityCursorCollection($query->handle($request->filter())))->toResponse($request);
    }

    #[OA\Get(
        path: '/api/admin/v1/projects/{project}/content/cities/regions',
        operationId: 'content_regions_api_admin_v1_projects_project_content_cities_regions',
        tags: ['content'],
        summary: 'GET /api/admin/v1/projects/{project}/content/cities/regions',
        security: [['bearerAuth' => []]],
        parameters: [new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string'))],
        responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated')],
    )]
    public function regions(Request $request, ListRegionsQuery $query): JsonResponse
    {
        return RegionResource::collection($query->handle())->toResponse($request);
    }

    #[OA\Put(
        path: '/api/admin/v1/projects/{project}/content/cities/{city}',
        operationId: 'content_update_api_admin_v1_projects_project_content_cities_city',
        tags: ['content'],
        summary: 'PUT /api/admin/v1/projects/{project}/content/cities/{city}',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'city', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(
            required: ['enabled'],
            properties: [new OA\Property(property: 'enabled', type: 'boolean')],
        )),
        responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')],
    )]
    public function update(
        SetCityEnabledRequest $request,
        string $project,
        int $city,
        SetCityEnabledHandler $handler,
        FindProjectCityQuery $query,
    ): JsonResponse {
        $handler->handle(new SetCityEnabledCommand($city, $request->boolean('enabled')));

        return (new CityResource($query->handle($city)))->toResponse($request);
    }

    #[OA\Post(
        path: '/api/admin/v1/projects/{project}/content/cities/enable-all',
        operationId: 'content_enable_all_api_admin_v1_projects_project_content_cities_enable_all',
        tags: ['content'],
        summary: 'POST /api/admin/v1/projects/{project}/content/cities/enable-all',
        security: [['bearerAuth' => []]],
        parameters: [new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string'))],
        responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated')],
    )]
    public function enableAll(Request $request, EnableAllCitiesHandler $handler): JsonResponse
    {
        return (new CityBulkResultResource(new CityBulkResultDTO($handler->handle())))->toResponse($request);
    }

    #[OA\Post(
        path: '/api/admin/v1/projects/{project}/content/cities/reset',
        operationId: 'content_reset_api_admin_v1_projects_project_content_cities_reset',
        tags: ['content'],
        summary: 'POST /api/admin/v1/projects/{project}/content/cities/reset',
        security: [['bearerAuth' => []]],
        parameters: [new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string'))],
        responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated')],
    )]
    public function reset(Request $request, ResetCitiesToStarterHandler $handler): JsonResponse
    {
        return (new CityBulkResultResource(new CityBulkResultDTO($handler->handle())))->toResponse($request);
    }

    #[OA\Get(
        path: '/api/admin/v1/projects/{project}/content/cities/{city}/seo',
        operationId: 'content_show_seo_api_admin_v1_projects_project_content_cities_city_seo',
        tags: ['content'],
        summary: 'GET /api/admin/v1/projects/{project}/content/cities/{city}/seo',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'city', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 404, description: 'Not found')],
    )]
    public function showSeo(Request $request, string $project, int $city, FindSeoQuery $query): JsonResponse
    {
        $seo = $query->handle(SeoableType::City->value, $city);

        return $seo === null
            ? ApiResponse::data(null)
            : (new SeoResource($seo))->toResponse($request);
    }

    #[OA\Put(
        path: '/api/admin/v1/projects/{project}/content/cities/{city}/seo',
        operationId: 'content_update_seo_api_admin_v1_projects_project_content_cities_city_seo',
        tags: ['content'],
        summary: 'PUT /api/admin/v1/projects/{project}/content/cities/{city}/seo',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'city', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
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
    public function updateSeo(
        UpsertSeoRequest $request,
        string $project,
        int $city,
        FindSeoableQuery $seoable,
        UpsertSeoHandler $handler,
    ): JsonResponse {
        $seo = $handler->handle(new UpsertSeoCommand($seoable->handle(SeoableType::City->value, $city), $request->upsert()));

        return (new SeoResource(SeoDTO::fromModel($seo)))->toResponse($request);
    }
}
