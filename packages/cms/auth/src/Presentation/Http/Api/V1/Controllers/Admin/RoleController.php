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
use Cms\Auth\Application\Queries\FindProjectRoleQuery;
use Cms\Auth\Application\Queries\ListRolesQuery;
use Cms\Auth\Domain\Models\Project;
use Cms\Auth\Domain\Policies\RolePolicy;
use Cms\Auth\Presentation\Http\Api\V1\Requests\Role\CreateRoleRequest;
use Cms\Auth\Presentation\Http\Api\V1\Requests\Role\RolePermissionsRequest;
use Cms\Auth\Presentation\Http\Api\V1\Resources\Role\RoleResource;
use Cms\Shared\Http\ApiResponse;
use Cms\Shared\Http\ErrorEnvelope;
use Illuminate\Auth\Access\Response as AccessResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

/** Кастомные роли проекта. Системные роли редактировать нельзя. */
final class RoleController
{
    #[OA\Get(path: '/api/admin/v1/projects/{project}/roles', operationId: 'auth_index_api_admin_v1_projects_project_roles', tags: ['auth'], summary: 'GET /api/admin/v1/projects/{project}/roles', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function index(Request $request, ListRolesQuery $query): JsonResponse
    {
        return RoleResource::collection($query->handle($request->attributes->get('project')))->toResponse($request);
    }

    public function store(CreateRoleRequest $request, CreateRoleHandler $command): JsonResponse
    {
        $data = CreateRoleDTO::from($request->validated());
        $role = $command->handle(new CreateRoleCommand($request->attributes->get('project'), $data));

        return (new RoleResource(RoleDTO::fromModel($role)))->toCreatedResponse($request);
    }

    #[OA\Put(path: '/api/admin/v1/projects/{project}/roles/{role}', operationId: 'auth_update_api_admin_v1_projects_project_roles_role', tags: ['auth'], summary: 'PUT /api/admin/v1/projects/{project}/roles/{role}', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function update(
        RolePermissionsRequest $request,
        string $project,
        int $roleId,
        UpdateRolePermissionsHandler $command,
        FindProjectRoleQuery $roles,
        RolePolicy $policy,
    ): JsonResponse {
        /** @var Project $projectModel */
        $projectModel = $request->attributes->get('project');

        // Принадлежность проекту — часть поиска (404), «системная» — отказ (403).
        // Порядок обязателен: чужая системная роль неотличима от несуществующей.
        $role = $roles->handle($projectModel, $roleId);

        if (($denied = $this->denial($policy->update($role))) !== null) {
            return $denied;
        }

        $updated = $command->handle(new UpdateRolePermissionsCommand(
            $projectModel,
            $role,
            RolePermissionsDTO::from($request->validated()),
        ));

        return (new RoleResource(RoleDTO::fromModel($updated)))->toResponse($request);
    }

    public function destroy(
        Request $request,
        string $project,
        int $roleId,
        DeleteRoleHandler $command,
        FindProjectRoleQuery $roles,
        RolePolicy $policy,
    ): JsonResponse {
        /** @var Project $projectModel */
        $projectModel = $request->attributes->get('project');

        $role = $roles->handle($projectModel, $roleId);

        if (($denied = $this->denial($policy->delete($role))) !== null) {
            return $denied;
        }

        $command->handle(new DeleteRoleCommand($projectModel, $role));

        return ApiResponse::noContent();
    }

    /** Отказ Policy отдаётся тем же конвертом и с тем же сообщением, что и раньше. */
    private function denial(AccessResponse $decision): ?JsonResponse
    {
        return $decision->denied()
            ? ErrorEnvelope::forbidden((string) $decision->message())
            : null;
    }
}
