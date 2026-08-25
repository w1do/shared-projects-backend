<?php

declare(strict_types=1);

namespace Cms\Auth\Presentation\Http\Api\V1\Controllers\Admin;

use Cms\Auth\Application\Commands\LoginAdminCommand;
use Cms\Auth\Application\Commands\UpdateAdminProfileCommand;
use Cms\Auth\Application\DTOs\Auth\AdminProfileDTO;
use Cms\Auth\Application\DTOs\Auth\LoginDTO;
use Cms\Auth\Application\DTOs\Auth\UpdateProfileDTO;
use Cms\Auth\Application\Handlers\LoginAdminHandler;
use Cms\Auth\Application\Handlers\UpdateAdminProfileHandler;
use Cms\Auth\Domain\Models\Admin;
use Cms\Shared\Http\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

final class AuthController
{
    #[OA\Post(path: '/api/admin/v1/auth/login', operationId: 'auth_login_api_admin_v1_auth_login', tags: ['auth'], summary: 'POST /api/admin/v1/auth/login', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function login(LoginDTO $data, Request $request, LoginAdminHandler $command): JsonResponse
    {
        $result = $command->handle(new LoginAdminCommand($data, (string) $request->ip()));

        return ApiResponse::data([
            'token' => $result['token'],
            'admin' => AdminProfileDTO::fromModel($result['admin']),
        ]);
    }

    #[OA\Post(path: '/api/admin/v1/auth/logout', operationId: 'auth_logout_api_admin_v1_auth_logout', tags: ['auth'], summary: 'POST /api/admin/v1/auth/logout', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function logout(Request $request): JsonResponse
    {
        /** @var Admin $admin */
        $admin = $request->user('admin');
        $admin->currentAccessToken()->delete();

        return ApiResponse::noContent();
    }

    #[OA\Get(path: '/api/admin/v1/me', operationId: 'auth_me_api_admin_v1_me', tags: ['auth'], summary: 'GET /api/admin/v1/me', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function me(Request $request): JsonResponse
    {
        /** @var Admin $admin */
        $admin = $request->user('admin');

        return ApiResponse::data(AdminProfileDTO::fromModel($admin));
    }

    public function updateProfile(UpdateProfileDTO $data, Request $request, UpdateAdminProfileHandler $command): JsonResponse
    {
        /** @var Admin $current */
        $current = $request->user('admin');
        $admin = $command->handle(new UpdateAdminProfileCommand($current, $data));

        return ApiResponse::data(AdminProfileDTO::fromModel($admin));
    }
}
