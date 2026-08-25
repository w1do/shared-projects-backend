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
use Cms\Auth\Application\Queries\ListProjects;
use Cms\Auth\Domain\Models\Admin;
use Cms\Shared\Http\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

final class ProjectController
{
    #[OA\Get(path: '/api/admin/v1/projects', operationId: 'auth_index_api_admin_v1_projects', tags: ['auth'], summary: 'GET /api/admin/v1/projects', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function index(Request $request, ListProjects $query): JsonResponse
    {
        /** @var Admin $admin */
        $admin = $request->user('admin');

        return ApiResponse::data(ProjectDTO::collect($query->handle($admin)));
    }

    public function store(CreateProjectDTO $data, Request $request, CreateProjectHandler $command): JsonResponse
    {
        /** @var Admin $admin */
        $admin = $request->user('admin');
        $project = $command->handle(new CreateProjectCommand($data, $admin));

        return ApiResponse::created(ProjectDTO::fromModel($project));
    }

    #[OA\Get(path: '/api/admin/v1/projects/{project}', operationId: 'auth_show_api_admin_v1_projects_project', tags: ['auth'], summary: 'GET /api/admin/v1/projects/{project}', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function show(Request $request): JsonResponse
    {
        return ApiResponse::data(ProjectDTO::fromModel($request->attributes->get('project')));
    }

    public function update(UpdateProjectDTO $data, Request $request, UpdateProjectHandler $command): JsonResponse
    {
        $project = $command->handle(new UpdateProjectCommand($request->attributes->get('project'), $data));

        return ApiResponse::data(ProjectDTO::fromModel($project));
    }

    #[OA\Post(path: '/api/admin/v1/projects/{project}/archive', operationId: 'auth_archive_api_admin_v1_projects_project_archive', tags: ['auth'], summary: 'POST /api/admin/v1/projects/{project}/archive', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function archive(Request $request, ArchiveProjectHandler $command): JsonResponse
    {
        $project = $command->handle(new ArchiveProjectCommand($request->attributes->get('project')));

        return ApiResponse::data(ProjectDTO::fromModel($project));
    }
}
