<?php

declare(strict_types=1);

namespace Cms\Auth\Presentation\Http\Api\V1\Controllers\Admin;

use Cms\Auth\Application\Commands\CreateRoleCommand;
use Cms\Auth\Application\Commands\DeleteRoleCommand;
use Cms\Auth\Application\Commands\UpdateRolePermissionsCommand;
use Cms\Auth\Application\DTOs\Role\CreateRoleDTO;
use Cms\Auth\Application\DTOs\Role\RoleDTO;
use Cms\Auth\Application\DTOs\Role\RolePermissionsDTO;
use Cms\Auth\Application\Handlers\CreateRoleHandler;
use Cms\Auth\Application\Handlers\DeleteRoleHandler;
use Cms\Auth\Application\Handlers\UpdateRolePermissionsHandler;
use Cms\Auth\Application\Queries\ListRoles;
use Cms\Auth\Domain\Models\Project;
use Cms\Shared\Http\ApiResponse;
use Cms\Shared\Http\ErrorEnvelope;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;
use Spatie\Permission\Models\Role;

/** Кастомные роли проекта. Системные роли редактировать нельзя. */
final class RoleController
{
    #[OA\Get(path: '/api/admin/v1/projects/{project}/roles', operationId: 'auth_index_api_admin_v1_projects_project_roles', tags: ['auth'], summary: 'GET /api/admin/v1/projects/{project}/roles', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function index(Request $request, ListRoles $query): JsonResponse
    {
        return ApiResponse::data($query->handle($request->attributes->get('project')));
    }

    public function store(CreateRoleDTO $data, Request $request, CreateRoleHandler $command): JsonResponse
    {
        $role = $command->handle(new CreateRoleCommand($request->attributes->get('project'), $data));

        return ApiResponse::created(RoleDTO::fromModel($role));
    }

    #[OA\Put(path: '/api/admin/v1/projects/{project}/roles/{role}', operationId: 'auth_update_api_admin_v1_projects_project_roles_role', tags: ['auth'], summary: 'PUT /api/admin/v1/projects/{project}/roles/{role}', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function update(RolePermissionsDTO $data, Request $request, string $project, int $roleId, UpdateRolePermissionsHandler $command): JsonResponse
    {
        [$projectModel, $role] = $this->find($request, $roleId);
        if ($role === null) {
            return ErrorEnvelope::notFound();
        }
        if ($this->isSystemRole($role->name)) {
            return ErrorEnvelope::forbidden('System roles cannot be modified.');
        }

        return ApiResponse::data(RoleDTO::fromModel($command->handle(new UpdateRolePermissionsCommand($projectModel, $role, $data))));
    }

    public function destroy(Request $request, string $project, int $roleId, DeleteRoleHandler $command): JsonResponse
    {
        [$projectModel, $role] = $this->find($request, $roleId);
        if ($role === null) {
            return ErrorEnvelope::notFound();
        }
        if ($this->isSystemRole($role->name)) {
            return ErrorEnvelope::forbidden('System roles cannot be deleted.');
        }

        $command->handle(new DeleteRoleCommand($projectModel, $role));

        return ApiResponse::noContent();
    }

    /** @return array{0: Project, 1: Role|null} */
    private function find(Request $request, int $roleId): array
    {
        /** @var Project $project */
        $project = $request->attributes->get('project');

        return [$project, Role::query()->where('project_id', $project->id)->whereKey($roleId)->first()];
    }

    private function isSystemRole(string $name): bool
    {
        return array_key_exists($name, config('cms-auth.system_roles', []));
    }
}
