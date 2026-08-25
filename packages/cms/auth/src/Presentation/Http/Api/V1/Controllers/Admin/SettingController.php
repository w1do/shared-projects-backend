<?php

declare(strict_types=1);

namespace Cms\Auth\Presentation\Http\Api\V1\Controllers\Admin;

use Cms\Auth\Application\Commands\PutSettingsCommand;
use Cms\Auth\Application\DTOs\Setting\SettingsPayloadDTO;
use Cms\Auth\Application\DTOs\Setting\SettingValueDTO;
use Cms\Auth\Application\Handlers\PutSettingsHandler;
use Cms\Auth\Application\Queries\GetServiceSettings;
use Cms\Shared\Http\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

final class SettingController
{
    #[OA\Get(path: '/api/admin/v1/projects/{project}/settings/{service}', operationId: 'auth_show_api_admin_v1_projects_project_settings_service', tags: ['auth'], summary: 'GET /api/admin/v1/projects/{project}/settings/{service}', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function show(Request $request, string $project, string $service, GetServiceSettings $query): JsonResponse
    {
        return ApiResponse::data($query->handle($request->attributes->get('project'), $service));
    }

    public function update(SettingsPayloadDTO $data, Request $request, string $project, string $service, PutSettingsHandler $command): JsonResponse
    {
        $saved = $command->handle(new PutSettingsCommand($request->attributes->get('project'), $service, $data));

        return ApiResponse::data(collect($saved)->map(SettingValueDTO::fromModel(...)));
    }
}
