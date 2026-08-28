<?php

declare(strict_types=1);

namespace Cms\Analytics\Presentation\Http\Api\V1\Controllers\Admin;

use Cms\Analytics\Application\Commands\UpdateAnalyticsSettingsCommand;
use Cms\Analytics\Application\DTOs\Settings\AnalyticsSettingsDTO;
use Cms\Analytics\Application\Handlers\UpdateAnalyticsSettingsHandler;
use Cms\Analytics\Application\Queries\GetAnalyticsSettingsQuery;
use Cms\Analytics\Presentation\Http\Api\V1\Requests\Settings\UpdateAnalyticsSettingsRequest;
use Cms\Analytics\Presentation\Http\Api\V1\Resources\Settings\AnalyticsSettingsResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

final class SettingsController
{
    #[OA\Get(path: '/api/admin/v1/projects/{project}/analytics/settings', operationId: 'analytics_show_api_admin_v1_projects_project_analytics_settings', tags: ['analytics'], summary: 'GET /api/admin/v1/projects/{project}/analytics/settings', security: [['bearerAuth' => []]], parameters: [new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string'))], responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 403, description: 'Forbidden')])]
    public function show(Request $request, GetAnalyticsSettingsQuery $query): JsonResponse
    {
        return (new AnalyticsSettingsResource($query->handle()))->toResponse($request);
    }

    #[OA\Put(
        path: '/api/admin/v1/projects/{project}/analytics/settings',
        operationId: 'analytics_update_api_admin_v1_projects_project_analytics_settings',
        tags: ['analytics'],
        summary: 'PUT /api/admin/v1/projects/{project}/analytics/settings',
        security: [['bearerAuth' => []]],
        parameters: [new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string'))],
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(
            required: ['yandex_enabled', 'google_enabled'],
            properties: [
                new OA\Property(property: 'yandex_enabled', type: 'boolean'),
                new OA\Property(property: 'yandex_id', type: 'string', maxLength: 64, nullable: true),
                new OA\Property(property: 'google_enabled', type: 'boolean'),
                new OA\Property(property: 'google_id', type: 'string', maxLength: 64, nullable: true),
            ],
        )),
        responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')],
    )]
    public function update(UpdateAnalyticsSettingsRequest $request, UpdateAnalyticsSettingsHandler $handler): JsonResponse
    {
        $saved = $handler->handle(new UpdateAnalyticsSettingsCommand(AnalyticsSettingsDTO::fromValidated($request->validated())));

        return (new AnalyticsSettingsResource($saved))->toResponse($request);
    }
}
