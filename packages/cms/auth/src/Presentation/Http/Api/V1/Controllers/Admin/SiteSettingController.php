<?php

declare(strict_types=1);

namespace Cms\Auth\Presentation\Http\Api\V1\Controllers\Admin;

use Cms\Auth\Application\Commands\UpdateSiteSettingsCommand;
use Cms\Auth\Application\DTOs\SiteSettings\SiteSettingsDTO;
use Cms\Auth\Application\Handlers\UpdateSiteSettingsHandler;
use Cms\Auth\Application\Queries\GetSiteSettingsQuery;
use Cms\Auth\Presentation\Http\Api\V1\Requests\SiteSettings\UpdateSiteSettingsRequest;
use Cms\Auth\Presentation\Http\Api\V1\Resources\SiteSettings\SiteSettingsResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

final class SiteSettingController
{
    #[OA\Get(path: '/api/admin/v1/projects/{project}/site-settings', operationId: 'auth_show_api_admin_v1_projects_project_site_settings', tags: ['auth'], summary: 'GET /api/admin/v1/projects/{project}/site-settings', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 403, description: 'Forbidden')])]
    public function show(Request $request, string $project, GetSiteSettingsQuery $query): JsonResponse
    {
        return (new SiteSettingsResource($query->handle()))->toResponse($request);
    }

    #[OA\Put(path: '/api/admin/v1/projects/{project}/site-settings', operationId: 'auth_update_api_admin_v1_projects_project_site_settings', tags: ['auth'], summary: 'PUT /api/admin/v1/projects/{project}/site-settings', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function update(UpdateSiteSettingsRequest $request, string $project, UpdateSiteSettingsHandler $handler): JsonResponse
    {
        $saved = $handler->handle(new UpdateSiteSettingsCommand(SiteSettingsDTO::fromValidated($request->validated())));

        return (new SiteSettingsResource($saved))->toResponse($request);
    }
}
