<?php

declare(strict_types=1);

namespace Cms\Auth\Presentation\Http\Api\V1\Controllers\Admin;

use Cms\Auth\Application\Commands\ToggleServiceCommand;
use Cms\Auth\Application\DTOs\Service\ServiceStatusDTO;
use Cms\Auth\Application\DTOs\Service\ToggleServiceDTO;
use Cms\Auth\Application\Handlers\ToggleServiceHandler;
use Cms\Auth\Application\Queries\ListServiceStatusesQuery;
use Cms\Auth\Presentation\Http\Api\V1\Requests\Service\ToggleServiceRequest;
use Cms\Auth\Presentation\Http\Api\V1\Resources\Service\ServiceStatusResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

final class ServiceController
{
    #[OA\Get(path: '/api/admin/v1/projects/{project}/services', operationId: 'auth_index_api_admin_v1_projects_project_services', tags: ['auth'], summary: 'GET /api/admin/v1/projects/{project}/services', security: [['bearerAuth' => []]], parameters: [new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string'))], responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function index(Request $request, ListServiceStatusesQuery $query): JsonResponse
    {
        return ServiceStatusResource::collection($query->handle($request->attributes->get('project')))->toResponse($request);
    }

    #[OA\Put(
        path: '/api/admin/v1/projects/{project}/services/{service}',
        operationId: 'auth_update_api_admin_v1_projects_project_services_service',
        tags: ['auth'],
        summary: 'PUT /api/admin/v1/projects/{project}/services/{service}',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'service', in: 'path', required: true, schema: new OA\Schema(type: 'string', enum: ['content', 'analytics', 'pay'])),
        ],
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(
            required: ['enabled'],
            properties: [
                new OA\Property(property: 'enabled', type: 'boolean'),
            ],
        )),
        responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')],
    )]
    public function update(ToggleServiceRequest $request, string $project, string $service, ToggleServiceHandler $command): JsonResponse
    {
        $data = ToggleServiceDTO::from($request->validated());
        $record = $command->handle(new ToggleServiceCommand($request->attributes->get('project'), $service, $data->enabled));

        return (new ServiceStatusResource(new ServiceStatusDTO($record->service, $record->enabled)))->toResponse($request);
    }
}
