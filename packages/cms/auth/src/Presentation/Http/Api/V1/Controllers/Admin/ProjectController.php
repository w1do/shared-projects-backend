<?php

declare(strict_types=1);

namespace Cms\Auth\Presentation\Http\Api\V1\Controllers\Admin;

use Cms\Auth\Application\Commands\ArchiveProjectCommand;
use Cms\Auth\Application\Commands\CreateProjectCommand;
use Cms\Auth\Application\Commands\UpdateProjectCommand;
use Cms\Auth\Application\DTOs\Project\CreateProjectDTO;
use Cms\Auth\Application\DTOs\Project\ProjectDTO;
use Cms\Auth\Application\DTOs\Project\UpdateProjectDTO;
use Cms\Auth\Application\Handlers\ArchiveProjectHandler;
use Cms\Auth\Application\Handlers\CreateProjectHandler;
use Cms\Auth\Application\Handlers\UpdateProjectHandler;
use Cms\Auth\Application\Queries\ListProjectsQuery;
use Cms\Auth\Domain\Models\Admin;
use Cms\Auth\Presentation\Http\Api\V1\Requests\Project\CreateProjectRequest;
use Cms\Auth\Presentation\Http\Api\V1\Requests\Project\UpdateProjectRequest;
use Cms\Auth\Presentation\Http\Api\V1\Resources\Project\ProjectResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

final class ProjectController
{
    #[OA\Get(path: '/api/admin/v1/projects', operationId: 'auth_index_api_admin_v1_projects', tags: ['auth'], summary: 'GET /api/admin/v1/projects', security: [['bearerAuth' => []]], responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function index(Request $request, ListProjectsQuery $query): JsonResponse
    {
        /** @var Admin $admin */
        $admin = $request->user('admin');

        return ProjectResource::collection(ProjectDTO::collect($query->handle($admin)))->toResponse($request);
    }

    #[OA\Post(
        path: '/api/admin/v1/projects',
        operationId: 'auth_store_api_admin_v1_projects',
        tags: ['auth'],
        summary: 'POST /api/admin/v1/projects',
        security: [['bearerAuth' => []]],
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(
            required: ['name'],
            properties: [
                new OA\Property(property: 'key', type: 'string', maxLength: 64, description: 'Необязателен: без него ключ выводится из названия'),
                new OA\Property(property: 'name', type: 'string', maxLength: 255),
                new OA\Property(property: 'locales', type: 'array', minItems: 1, items: new OA\Items(type: 'string', maxLength: 10)),
            ],
        )),
        responses: [new OA\Response(response: 201, description: 'Created'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')],
    )]
    public function store(CreateProjectRequest $request, CreateProjectHandler $command): JsonResponse
    {
        /** @var Admin $admin */
        $admin = $request->user('admin');

        // И1: DTO с |Optional собирается только из validated(), без достройки ключей
        $project = $command->handle(new CreateProjectCommand(CreateProjectDTO::from($request->validated()), $admin));

        return (new ProjectResource(ProjectDTO::fromModel($project)))->toCreatedResponse($request);
    }

    #[OA\Get(path: '/api/admin/v1/projects/{project}', operationId: 'auth_show_api_admin_v1_projects_project', tags: ['auth'], summary: 'GET /api/admin/v1/projects/{project}', security: [['bearerAuth' => []]], parameters: [new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string'))], responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function show(Request $request): JsonResponse
    {
        return (new ProjectResource(ProjectDTO::fromModel($request->attributes->get('project'))))->toResponse($request);
    }

    #[OA\Patch(
        path: '/api/admin/v1/projects/{project}',
        operationId: 'auth_update_api_admin_v1_projects_project',
        tags: ['auth'],
        summary: 'PATCH /api/admin/v1/projects/{project}',
        security: [['bearerAuth' => []]],
        parameters: [new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string'))],
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'name', type: 'string', maxLength: 255),
                new OA\Property(property: 'locales', type: 'array', minItems: 1, items: new OA\Items(type: 'string', maxLength: 10)),
            ],
        )),
        responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')],
    )]
    public function update(UpdateProjectRequest $request, UpdateProjectHandler $command): JsonResponse
    {
        $project = $command->handle(new UpdateProjectCommand(
            $request->attributes->get('project'),
            UpdateProjectDTO::from($request->validated()),
        ));

        return (new ProjectResource(ProjectDTO::fromModel($project)))->toResponse($request);
    }

    #[OA\Post(path: '/api/admin/v1/projects/{project}/archive', operationId: 'auth_archive_api_admin_v1_projects_project_archive', tags: ['auth'], summary: 'POST /api/admin/v1/projects/{project}/archive', security: [['bearerAuth' => []]], parameters: [new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string'))], responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function archive(Request $request, ArchiveProjectHandler $command): JsonResponse
    {
        $project = $command->handle(new ArchiveProjectCommand($request->attributes->get('project')));

        return (new ProjectResource(ProjectDTO::fromModel($project)))->toResponse($request);
    }
}
