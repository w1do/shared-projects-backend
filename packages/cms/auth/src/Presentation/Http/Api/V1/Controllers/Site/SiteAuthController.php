<?php

declare(strict_types=1);

namespace Cms\Auth\Presentation\Http\Api\V1\Controllers\Site;

use Cms\Auth\Application\Commands\ForgotSitePasswordCommand;
use Cms\Auth\Application\Commands\LoginSiteUserCommand;
use Cms\Auth\Application\Commands\LogoutCommand;
use Cms\Auth\Application\Commands\RegisterSiteUserCommand;
use Cms\Auth\Application\Commands\ResetSitePasswordCommand;
use Cms\Auth\Application\Commands\UpdateSiteProfileCommand;
use Cms\Auth\Application\DTOs\Auth\ForgotPasswordDTO;
use Cms\Auth\Application\DTOs\Auth\LoginDTO;
use Cms\Auth\Application\DTOs\Auth\ResetPasswordDTO;
use Cms\Auth\Application\DTOs\User\SiteRegisterDTO;
use Cms\Auth\Application\DTOs\User\SiteUpdateProfileDTO;
use Cms\Auth\Application\DTOs\User\SiteUserDTO;
use Cms\Auth\Application\Handlers\ForgotSitePasswordHandler;
use Cms\Auth\Application\Handlers\LoginSiteUserHandler;
use Cms\Auth\Application\Handlers\LogoutHandler;
use Cms\Auth\Application\Handlers\RegisterSiteUserHandler;
use Cms\Auth\Application\Handlers\ResetSitePasswordHandler;
use Cms\Auth\Application\Handlers\UpdateSiteProfileHandler;
use Cms\Auth\Domain\Models\User;
use Cms\Auth\Presentation\Http\Api\V1\Requests\Auth\ForgotPasswordRequest;
use Cms\Auth\Presentation\Http\Api\V1\Requests\Auth\LoginRequest;
use Cms\Auth\Presentation\Http\Api\V1\Requests\Auth\ResetPasswordRequest;
use Cms\Auth\Presentation\Http\Api\V1\Requests\User\SiteRegisterRequest;
use Cms\Auth\Presentation\Http\Api\V1\Requests\User\SiteUpdateProfileRequest;
use Cms\Auth\Presentation\Http\Api\V1\Resources\Auth\PasswordResetDoneResource;
use Cms\Auth\Presentation\Http\Api\V1\Resources\Auth\PasswordResetSentResource;
use Cms\Auth\Presentation\Http\Api\V1\Resources\User\SiteAuthTokenResource;
use Cms\Auth\Presentation\Http\Api\V1\Resources\User\SiteUserResource;
use Cms\Shared\Http\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

/**
 * Аутентификация пользователей сайтов (guard web). Проект — из API-ключа сайта
 * (ResolveSiteProject), токен действует только в проекте, где выдан.
 *
 * Проверка «токен того же проекта, пользователь не заблокирован» — в middleware
 * `EnsureSiteUser`; сюда пользователь приходит уже проверенным.
 */
final class SiteAuthController
{
    #[OA\Post(
        path: '/api/v1/auth/register',
        operationId: 'auth_register_api_v1_auth_register',
        tags: ['auth'],
        summary: 'POST /api/v1/auth/register',
        security: [['apiKey' => []]],
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(
            required: ['email', 'password'],
            properties: [
                new OA\Property(property: 'email', type: 'string', format: 'email'),
                new OA\Property(property: 'password', type: 'string', minLength: 8),
                new OA\Property(property: 'name', type: 'string', maxLength: 255),
            ],
        )),
        responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')],
    )]
    public function register(SiteRegisterRequest $request, RegisterSiteUserHandler $command): JsonResponse
    {
        $result = $command->handle(new RegisterSiteUserCommand(
            $request->attributes->get('project_id'),
            SiteRegisterDTO::from($request->validated()),
        ));

        return (new SiteAuthTokenResource($result))->toCreatedResponse($request);
    }

    #[OA\Post(
        path: '/api/v1/auth/login',
        operationId: 'auth_login_api_v1_auth_login',
        tags: ['auth'],
        summary: 'POST /api/v1/auth/login',
        security: [['apiKey' => []]],
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(
            required: ['email', 'password'],
            properties: [
                new OA\Property(property: 'email', type: 'string', format: 'email'),
                new OA\Property(property: 'password', type: 'string'),
            ],
        )),
        responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')],
    )]
    public function login(LoginRequest $request, LoginSiteUserHandler $command): JsonResponse
    {
        $result = $command->handle(new LoginSiteUserCommand(
            $request->attributes->get('project_id'),
            LoginDTO::from($request->validated()),
            (string) $request->ip(),
        ));

        return (new SiteAuthTokenResource($result))->toResponse($request);
    }

    #[OA\Post(path: '/api/v1/auth/logout', operationId: 'auth_logout_api_v1_auth_logout', tags: ['auth'], summary: 'POST /api/v1/auth/logout', security: [['apiKey' => [], 'bearerAuth' => []]], responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function logout(Request $request, LogoutHandler $command): JsonResponse
    {
        $command->handle(new LogoutCommand($this->user($request)));

        return ApiResponse::noContent();
    }

    #[OA\Get(path: '/api/v1/auth/me', operationId: 'auth_me_api_v1_auth_me', tags: ['auth'], summary: 'GET /api/v1/auth/me', security: [['apiKey' => [], 'bearerAuth' => []]], responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function me(Request $request): JsonResponse
    {
        return (new SiteUserResource(SiteUserDTO::fromModel($this->user($request))))->toResponse($request);
    }

    #[OA\Patch(
        path: '/api/v1/auth/me',
        operationId: 'auth_updateProfile_api_v1_auth_me',
        tags: ['auth'],
        summary: 'PATCH /api/v1/auth/me',
        security: [['apiKey' => [], 'bearerAuth' => []]],
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'name', type: 'string', maxLength: 255),
                new OA\Property(property: 'password', type: 'string', minLength: 8),
                new OA\Property(property: 'current_password', type: 'string'),
            ],
        )),
        responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')],
    )]
    public function updateProfile(SiteUpdateProfileRequest $request, UpdateSiteProfileHandler $command): JsonResponse
    {
        // И1: Optional-семантика держится на validated() — никаких `?? null`
        $user = $command->handle(new UpdateSiteProfileCommand(
            $this->user($request),
            SiteUpdateProfileDTO::from($request->validated()),
        ));

        return (new SiteUserResource(SiteUserDTO::fromModel($user)))->toResponse($request);
    }

    #[OA\Post(
        path: '/api/v1/auth/forgot-password',
        operationId: 'auth_forgot_api_v1_auth_forgot_password',
        tags: ['auth'],
        summary: 'POST /api/v1/auth/forgot-password',
        security: [['apiKey' => []]],
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(
            required: ['email'],
            properties: [
                new OA\Property(property: 'email', type: 'string', format: 'email'),
            ],
        )),
        responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')],
    )]
    public function forgot(ForgotPasswordRequest $request, ForgotSitePasswordHandler $command): JsonResponse
    {
        $command->handle(new ForgotSitePasswordCommand(
            $request->attributes->get('project_id'),
            ForgotPasswordDTO::from($request->validated()),
        ));

        return (new PasswordResetSentResource)->toResponse($request);
    }

    #[OA\Post(
        path: '/api/v1/auth/reset-password',
        operationId: 'auth_reset_api_v1_auth_reset_password',
        tags: ['auth'],
        summary: 'POST /api/v1/auth/reset-password',
        security: [['apiKey' => []]],
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
    public function reset(ResetPasswordRequest $request, ResetSitePasswordHandler $command): JsonResponse
    {
        $command->handle(new ResetSitePasswordCommand(
            $request->attributes->get('project_id'),
            ResetPasswordDTO::from($request->validated()),
        ));

        return (new PasswordResetDoneResource)->toResponse($request);
    }

    /** Пользователь, проверенный middleware `EnsureSiteUser`. */
    private function user(Request $request): User
    {
        /** @var User $user */
        $user = $request->attributes->get('site_user');

        return $user;
    }
}
