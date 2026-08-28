<?php

declare(strict_types=1);

namespace Cms\Auth\Presentation\Http\Api\V1\Controllers\Admin;

use Cms\Auth\Application\Commands\ForgotAdminPasswordCommand;
use Cms\Auth\Application\Commands\ResetAdminPasswordCommand;
use Cms\Auth\Application\DTOs\Auth\ForgotPasswordDTO;
use Cms\Auth\Application\DTOs\Auth\ResetPasswordDTO;
use Cms\Auth\Application\Handlers\ForgotAdminPasswordHandler;
use Cms\Auth\Application\Handlers\ResetAdminPasswordHandler;
use Cms\Auth\Presentation\Http\Api\V1\Requests\Auth\ForgotPasswordRequest;
use Cms\Auth\Presentation\Http\Api\V1\Requests\Auth\ResetPasswordRequest;
use Cms\Auth\Presentation\Http\Api\V1\Resources\Auth\PasswordResetDoneResource;
use Cms\Auth\Presentation\Http\Api\V1\Resources\Auth\PasswordResetSentResource;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

final class PasswordResetController
{
    #[OA\Post(
        path: '/api/admin/v1/auth/forgot-password',
        operationId: 'auth_forgot_api_admin_v1_auth_forgot_password',
        tags: ['auth'],
        summary: 'POST /api/admin/v1/auth/forgot-password',
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(
            required: ['email'],
            properties: [
                new OA\Property(property: 'email', type: 'string', format: 'email'),
            ],
        )),
        responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')],
    )]
    public function forgot(ForgotPasswordRequest $request, ForgotAdminPasswordHandler $command): JsonResponse
    {
        $command->handle(new ForgotAdminPasswordCommand(ForgotPasswordDTO::from($request->validated())));

        return (new PasswordResetSentResource)->toResponse($request);
    }

    #[OA\Post(
        path: '/api/admin/v1/auth/reset-password',
        operationId: 'auth_reset_api_admin_v1_auth_reset_password',
        tags: ['auth'],
        summary: 'POST /api/admin/v1/auth/reset-password',
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(
            required: ['email', 'token', 'password'],
            properties: [
                new OA\Property(property: 'email', type: 'string', format: 'email'),
                new OA\Property(property: 'token', type: 'string'),
                new OA\Property(property: 'password', type: 'string', minLength: 8),
            ],
        )),
        responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')],
    )]
    public function reset(ResetPasswordRequest $request, ResetAdminPasswordHandler $command): JsonResponse
    {
        $command->handle(new ResetAdminPasswordCommand(ResetPasswordDTO::from($request->validated())));

        return (new PasswordResetDoneResource)->toResponse($request);
    }
}
