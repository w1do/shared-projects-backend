<?php

declare(strict_types=1);

namespace Cms\Auth\Presentation\Http\Api\V1\Controllers\Admin;

use Cms\Auth\Application\Commands\ForgotAdminPasswordCommand;
use Cms\Auth\Application\Commands\ResetAdminPasswordCommand;
use Cms\Auth\Application\DTOs\Auth\ForgotPasswordDTO;
use Cms\Auth\Application\DTOs\Auth\ResetPasswordDTO;
use Cms\Auth\Application\Handlers\ForgotAdminPasswordHandler;
use Cms\Auth\Application\Handlers\ResetAdminPasswordHandler;
use Cms\Shared\Http\ApiResponse;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

final class PasswordResetController
{
    #[OA\Post(path: '/api/admin/v1/auth/forgot-password', operationId: 'auth_forgot_api_admin_v1_auth_forgot_password', tags: ['auth'], summary: 'POST /api/admin/v1/auth/forgot-password', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function forgot(ForgotPasswordDTO $data, ForgotAdminPasswordHandler $command): JsonResponse
    {
        $command->handle(new ForgotAdminPasswordCommand($data));

        return ApiResponse::data(['sent' => true]);
    }

    #[OA\Post(path: '/api/admin/v1/auth/reset-password', operationId: 'auth_reset_api_admin_v1_auth_reset_password', tags: ['auth'], summary: 'POST /api/admin/v1/auth/reset-password', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function reset(ResetPasswordDTO $data, ResetAdminPasswordHandler $command): JsonResponse
    {
        $command->handle(new ResetAdminPasswordCommand($data));

        return ApiResponse::data(['reset' => true]);
    }
}
