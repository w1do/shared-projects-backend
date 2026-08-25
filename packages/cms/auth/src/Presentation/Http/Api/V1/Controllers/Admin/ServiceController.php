<?php

declare(strict_types=1);

namespace Cms\Auth\Presentation\Http\Api\V1\Controllers\Admin;

use Cms\Auth\Application\Commands\ToggleServiceCommand;
use Cms\Auth\Application\DTOs\Service\ToggleServiceDTO;
use Cms\Auth\Application\Handlers\ToggleServiceHandler;
use Cms\Auth\Application\Queries\ListServiceStatuses;
use Cms\Shared\Http\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

final class ServiceController
{
    #[OA\Get(path: '/api/admin/v1/projects/{project}/services', operationId: 'auth_index_api_admin_v1_projects_project_services', tags: ['auth'], summary: 'GET /api/admin/v1/projects/{project}/services', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function index(Request $request, ListServiceStatuses $query): JsonResponse
    {
        return ApiResponse::data($query->handle($request->attributes->get('project')));
    }

    #[OA\Put(path: '/api/admin/v1/projects/{project}/services/{service}', operationId: 'auth_update_api_admin_v1_projects_project_services_service', tags: ['auth'], summary: 'PUT /api/admin/v1/projects/{project}/services/{service}', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function update(ToggleServiceDTO $data, Request $request, string $project, string $service, ToggleServiceHandler $command): JsonResponse
    {
        $record = $command->handle(new ToggleServiceCommand($request->attributes->get('project'), $service, $data->enabled));

        return ApiResponse::data(['service' => $record->service, 'enabled' => $record->enabled]);
    }
}
