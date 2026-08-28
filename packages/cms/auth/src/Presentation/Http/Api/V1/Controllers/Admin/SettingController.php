<?php

declare(strict_types=1);

namespace Cms\Auth\Presentation\Http\Api\V1\Controllers\Admin;

use Cms\Auth\Application\Commands\PutSettingsCommand;
use Cms\Auth\Application\DTOs\Setting\SettingsPayloadDTO;
use Cms\Auth\Application\DTOs\Setting\SettingValueDTO;
use Cms\Auth\Application\Handlers\PutSettingsHandler;
use Cms\Auth\Application\Queries\GetServiceSettingsQuery;
use Cms\Auth\Presentation\Http\Api\V1\Requests\Setting\PutSettingsRequest;
use Cms\Auth\Presentation\Http\Api\V1\Resources\Setting\SettingValueResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

final class SettingController
{
    #[OA\Get(path: '/api/admin/v1/projects/{project}/settings/{service}', operationId: 'auth_show_api_admin_v1_projects_project_settings_service', tags: ['auth'], summary: 'GET /api/admin/v1/projects/{project}/settings/{service}', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function show(Request $request, string $project, string $service, GetServiceSettingsQuery $query): JsonResponse
    {
        return SettingValueResource::collection($query->handle($request->attributes->get('project'), $service))->toResponse($request);
    }

    #[OA\Put(
        path: '/api/admin/v1/projects/{project}/settings/{service}',
        operationId: 'auth_update_api_admin_v1_projects_project_settings_service',
        tags: ['auth'],
        summary: 'PUT /api/admin/v1/projects/{project}/settings/{service}',
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(
            required: ['values'],
            properties: [
                new OA\Property(property: 'values', type: 'object'),
            ],
        )),
        responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')],
    )]
    public function update(PutSettingsRequest $request, string $project, string $service, PutSettingsHandler $command): JsonResponse
    {
        $saved = $command->handle(new PutSettingsCommand(
            $request->attributes->get('project'),
            $service,
            SettingsPayloadDTO::from($request->validated()),
        ));

        return SettingValueResource::collection(
            collect($saved)->map(SettingValueDTO::fromModel(...)),
        )->toResponse($request);
    }
}
