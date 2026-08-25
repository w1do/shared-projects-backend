<?php

declare(strict_types=1);

namespace Cms\Auth\Presentation\Http\Api\V1\Controllers\Admin;

use Cms\Auth\Application\Commands\BlockUserCommand;
use Cms\Auth\Application\Commands\DeleteUserCommand;
use Cms\Auth\Application\DTOs\User\SiteUserDTO;
use Cms\Auth\Application\Handlers\BlockUserHandler;
use Cms\Auth\Application\Handlers\DeleteUserHandler;
use Cms\Auth\Application\Queries\ListProjectUsers;
use Cms\Auth\Domain\Models\User;
use Cms\Shared\Http\ApiResponse;
use Cms\Shared\Http\ErrorEnvelope;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

/** Управление пользователями сайта проекта из админки (права auth.users.*). */
final class ProjectUserController
{
    #[OA\Get(path: '/api/admin/v1/projects/{project}/users', operationId: 'auth_index_api_admin_v1_projects_project_users', tags: ['auth'], summary: 'GET /api/admin/v1/projects/{project}/users', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function index(Request $request, ListProjectUsers $query): JsonResponse
    {
        return ApiResponse::cursorPage($query->handle(), fn (User $u) => SiteUserDTO::fromModel($u));
    }

    #[OA\Post(path: '/api/admin/v1/projects/{project}/users/{user}/block', operationId: 'auth_block_api_admin_v1_projects_project_users_user_block', tags: ['auth'], summary: 'POST /api/admin/v1/projects/{project}/users/{user}/block', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function block(Request $request, string $project, int $userId, BlockUserHandler $command): JsonResponse
    {
        $user = User::query()->whereKey($userId)->first();
        if ($user === null) {
            return ErrorEnvelope::notFound();
        }

        return ApiResponse::data(SiteUserDTO::fromModel($command->handle(new BlockUserCommand($user, true))));
    }

    #[OA\Post(path: '/api/admin/v1/projects/{project}/users/{user}/unblock', operationId: 'auth_unblock_api_admin_v1_projects_project_users_user_unblock', tags: ['auth'], summary: 'POST /api/admin/v1/projects/{project}/users/{user}/unblock', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function unblock(Request $request, string $project, int $userId, BlockUserHandler $command): JsonResponse
    {
        $user = User::query()->whereKey($userId)->first();
        if ($user === null) {
            return ErrorEnvelope::notFound();
        }

        return ApiResponse::data(SiteUserDTO::fromModel($command->handle(new BlockUserCommand($user, false))));
    }

    #[OA\Delete(path: '/api/admin/v1/projects/{project}/users/{user}', operationId: 'auth_destroy_api_admin_v1_projects_project_users_user', tags: ['auth'], summary: 'DELETE /api/admin/v1/projects/{project}/users/{user}', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function destroy(Request $request, string $project, int $userId, DeleteUserHandler $command): JsonResponse
    {
        $user = User::query()->whereKey($userId)->first();
        if ($user === null) {
            return ErrorEnvelope::notFound();
        }

        $command->handle(new DeleteUserCommand($user));

        return ApiResponse::noContent();
    }
}
