<?php

declare(strict_types=1);

namespace Cms\Auth\Presentation\Http\Api\V1\Controllers\Admin;

use Cms\Auth\Application\Commands\LoginAdminCommand;
use Cms\Auth\Application\Commands\LogoutCommand;
use Cms\Auth\Application\Commands\UpdateAdminProfileCommand;
use Cms\Auth\Application\DTOs\Auth\AdminProfileDTO;
use Cms\Auth\Application\DTOs\Auth\LoginDTO;
use Cms\Auth\Application\DTOs\Auth\UpdateProfileDTO;
use Cms\Auth\Application\Handlers\LoginAdminHandler;
use Cms\Auth\Application\Handlers\LogoutHandler;
use Cms\Auth\Application\Handlers\UpdateAdminProfileHandler;
use Cms\Auth\Domain\Models\Admin;
use Cms\Auth\Presentation\Http\Api\V1\Requests\Auth\LoginRequest;
use Cms\Auth\Presentation\Http\Api\V1\Requests\Auth\UpdateProfileRequest;
use Cms\Auth\Presentation\Http\Api\V1\Resources\Auth\AdminProfileResource;
use Cms\Auth\Presentation\Http\Api\V1\Resources\Auth\AuthTokenResource;
use Cms\Shared\Http\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

final class AuthController
{
    #[OA\Post(path: '/api/admin/v1/auth/login', operationId: 'auth_login_api_admin_v1_auth_login', tags: ['auth'], summary: 'POST /api/admin/v1/auth/login', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function login(LoginRequest $request, LoginAdminHandler $command): JsonResponse
    {
        $result = $command->handle(new LoginAdminCommand(
            LoginDTO::from($request->validated()),
            (string) $request->ip(),
        ));

        return (new AuthTokenResource($result))->toResponse($request);
    }

    #[OA\Post(path: '/api/admin/v1/auth/logout', operationId: 'auth_logout_api_admin_v1_auth_logout', tags: ['auth'], summary: 'POST /api/admin/v1/auth/logout', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function logout(Request $request, LogoutHandler $command): JsonResponse
    {
        /** @var Admin $admin */
        $admin = $request->user('admin');

        $command->handle(new LogoutCommand($admin));

        return ApiResponse::noContent();
    }

    #[OA\Get(path: '/api/admin/v1/me', operationId: 'auth_me_api_admin_v1_me', tags: ['auth'], summary: 'GET /api/admin/v1/me', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function me(Request $request): JsonResponse
    {
        /** @var Admin $admin */
        $admin = $request->user('admin');

        return (new AdminProfileResource(AdminProfileDTO::fromModel($admin)))->toResponse($request);
    }

    public function updateProfile(UpdateProfileRequest $request, UpdateAdminProfileHandler $command): JsonResponse
    {
        /** @var Admin $current */
        $current = $request->user('admin');

        // И1: Optional-семантика держится на validated() — никаких `?? null`
        $admin = $command->handle(new UpdateAdminProfileCommand($current, UpdateProfileDTO::from($request->validated())));

        return (new AdminProfileResource(AdminProfileDTO::fromModel($admin)))->toResponse($request);
    }
}
