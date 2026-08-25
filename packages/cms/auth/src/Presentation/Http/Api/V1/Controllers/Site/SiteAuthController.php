<?php

declare(strict_types=1);

namespace Cms\Auth\Presentation\Http\Api\V1\Controllers\Site;

use Cms\Auth\Application\Commands\ForgotSitePasswordCommand;
use Cms\Auth\Application\Commands\LoginSiteUserCommand;
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
use Cms\Auth\Application\Handlers\RegisterSiteUserHandler;
use Cms\Auth\Application\Handlers\ResetSitePasswordHandler;
use Cms\Auth\Application\Handlers\UpdateSiteProfileHandler;
use Cms\Auth\Domain\Models\User;
use Cms\Shared\Http\ApiResponse;
use Cms\Shared\Http\ErrorEnvelope;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

/**
 * Аутентификация пользователей сайтов (guard web). Проект — из API-ключа сайта
 * (ResolveSiteProject), токен действует только в проекте, где выдан.
 */
final class SiteAuthController
{
    #[OA\Post(path: '/api/v1/auth/register', operationId: 'auth_register_api_v1_auth_register', tags: ['auth'], summary: 'POST /api/v1/auth/register', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function register(SiteRegisterDTO $data, Request $request, RegisterSiteUserHandler $command): JsonResponse
    {
        $result = $command->handle(new RegisterSiteUserCommand($request->attributes->get('project_id'), $data));

        return ApiResponse::created([
            'token' => $result['token'],
            'user' => SiteUserDTO::fromModel($result['user']),
        ]);
    }

    #[OA\Post(path: '/api/v1/auth/login', operationId: 'auth_login_api_v1_auth_login', tags: ['auth'], summary: 'POST /api/v1/auth/login', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function login(LoginDTO $data, Request $request, LoginSiteUserHandler $command): JsonResponse
    {
        $result = $command->handle(new LoginSiteUserCommand($request->attributes->get('project_id'), $data, (string) $request->ip()));

        return ApiResponse::data([
            'token' => $result['token'],
            'user' => SiteUserDTO::fromModel($result['user']),
        ]);
    }

    #[OA\Post(path: '/api/v1/auth/logout', operationId: 'auth_logout_api_v1_auth_logout', tags: ['auth'], summary: 'POST /api/v1/auth/logout', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function logout(Request $request): JsonResponse
    {
        $user = $this->currentUser($request);
        if ($user === null) {
            return ErrorEnvelope::unauthorized();
        }

        $user->currentAccessToken()->delete();

        return ApiResponse::noContent();
    }

    #[OA\Get(path: '/api/v1/auth/me', operationId: 'auth_me_api_v1_auth_me', tags: ['auth'], summary: 'GET /api/v1/auth/me', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function me(Request $request): JsonResponse
    {
        $user = $this->currentUser($request);
        if ($user === null) {
            return ErrorEnvelope::unauthorized();
        }

        return ApiResponse::data(SiteUserDTO::fromModel($user));
    }

    public function updateProfile(SiteUpdateProfileDTO $data, Request $request, UpdateSiteProfileHandler $command): JsonResponse
    {
        $user = $this->currentUser($request);
        if ($user === null) {
            return ErrorEnvelope::unauthorized();
        }

        return ApiResponse::data(SiteUserDTO::fromModel($command->handle(new UpdateSiteProfileCommand($user, $data))));
    }

    #[OA\Post(path: '/api/v1/auth/forgot-password', operationId: 'auth_forgot_api_v1_auth_forgot_password', tags: ['auth'], summary: 'POST /api/v1/auth/forgot-password', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function forgot(ForgotPasswordDTO $data, Request $request, ForgotSitePasswordHandler $command): JsonResponse
    {
        $command->handle(new ForgotSitePasswordCommand($request->attributes->get('project_id'), $data));

        return ApiResponse::data(['sent' => true]);
    }

    #[OA\Post(path: '/api/v1/auth/reset-password', operationId: 'auth_reset_api_v1_auth_reset_password', tags: ['auth'], summary: 'POST /api/v1/auth/reset-password', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function reset(ResetPasswordDTO $data, Request $request, ResetSitePasswordHandler $command): JsonResponse
    {
        $command->handle(new ResetSitePasswordCommand($request->attributes->get('project_id'), $data));

        return ApiResponse::data(['reset' => true]);
    }

    /** Токен guard web действителен только с ключом того же проекта. */
    private function currentUser(Request $request): ?User
    {
        /** @var User|null $user */
        $user = $request->user('web');
        $projectId = $request->attributes->get('project_id');

        if ($user === null || $user->isBlocked() || $user->project_id !== $projectId) {
            return null;
        }

        return $user;
    }
}
