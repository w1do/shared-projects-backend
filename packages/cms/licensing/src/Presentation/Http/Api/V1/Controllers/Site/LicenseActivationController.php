<?php

declare(strict_types=1);

namespace Cms\Licensing\Presentation\Http\Api\V1\Controllers\Site;

use Cms\Licensing\Application\Commands\ActivateLicenseCommand;
use Cms\Licensing\Application\Commands\DeactivateInstallationCommand;
use Cms\Licensing\Application\Commands\RefreshLicenseCommand;
use Cms\Licensing\Application\Handlers\ActivateLicenseHandler;
use Cms\Licensing\Application\Handlers\DeactivateInstallationHandler;
use Cms\Licensing\Application\Handlers\RefreshLicenseHandler;
use Cms\Licensing\Presentation\Http\Api\V1\Requests\License\ActivationRequest;
use Cms\Licensing\Presentation\Http\Api\V1\Requests\License\DeactivationRequest;
use Cms\Licensing\Presentation\Http\Api\V1\Resources\License\ActivationResource;
use Cms\Licensing\Presentation\Http\Api\V1\Resources\License\DeactivationResource;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

/**
 * Публичный активационный контракт (ТЗ 1.7): без аутентификации — ключ
 * и есть аутентификация, проект резолвится по нему; throttle от перебора.
 */
final class LicenseActivationController
{
    #[OA\Post(path: '/api/v1/pay/licensing/license/activate', operationId: 'licensing_activate_license', tags: ['pay'], summary: 'POST /api/v1/pay/licensing/license/activate', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 404, description: 'Not found'), new OA\Response(response: 409, description: 'Installation limit reached'), new OA\Response(response: 422, description: 'Validation error'), new OA\Response(response: 429, description: 'Too many requests')])]
    public function activate(ActivationRequest $request, ActivateLicenseHandler $handler): JsonResponse
    {
        $validated = $request->validated();

        $result = $handler->handle(new ActivateLicenseCommand(
            key: (string) $validated['key'],
            installId: (string) $validated['install_id'],
            domain: (string) $validated['domain'],
            appVersion: (string) $validated['app_version'],
            ip: $request->ip(),
        ));

        return (new ActivationResource($result))->toResponse($request);
    }

    #[OA\Post(path: '/api/v1/pay/licensing/license/refresh', operationId: 'licensing_refresh_license', tags: ['pay'], summary: 'POST /api/v1/pay/licensing/license/refresh', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 404, description: 'Not found'), new OA\Response(response: 422, description: 'Validation error'), new OA\Response(response: 429, description: 'Too many requests')])]
    public function refresh(ActivationRequest $request, RefreshLicenseHandler $handler): JsonResponse
    {
        $validated = $request->validated();

        $result = $handler->handle(new RefreshLicenseCommand(
            key: (string) $validated['key'],
            installId: (string) $validated['install_id'],
            domain: (string) $validated['domain'],
            appVersion: (string) $validated['app_version'],
            ip: $request->ip(),
        ));

        return (new ActivationResource($result))->toResponse($request);
    }

    #[OA\Post(path: '/api/v1/pay/licensing/license/deactivate', operationId: 'licensing_deactivate_license', tags: ['pay'], summary: 'POST /api/v1/pay/licensing/license/deactivate', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 404, description: 'Not found'), new OA\Response(response: 422, description: 'Validation error'), new OA\Response(response: 429, description: 'Too many requests')])]
    public function deactivate(DeactivationRequest $request, DeactivateInstallationHandler $handler): JsonResponse
    {
        $validated = $request->validated();

        $handler->handle(new DeactivateInstallationCommand(
            key: (string) $validated['key'],
            installId: (string) $validated['install_id'],
        ));

        return (new DeactivationResource(null))->toResponse($request);
    }
}
