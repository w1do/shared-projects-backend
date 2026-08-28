<?php

declare(strict_types=1);

namespace Cms\Licensing\Presentation\Http\Api\V1\Controllers\Site;

use Cms\Licensing\Application\Queries\CheckUpdatesQuery;
use Cms\Licensing\Presentation\Http\Api\V1\Requests\License\CheckUpdatesRequest;
use Cms\Licensing\Presentation\Http\Api\V1\Resources\License\UpdatesCheckResource;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

/** Публичная проверка обновлений (ТЗ 1.7): security-патчи и `latest_available`. */
final class CheckUpdatesController
{
    #[OA\Post(path: '/api/v1/pay/licensing/updates/check', operationId: 'licensing_check_updates', tags: ['pay'], summary: 'POST /api/v1/pay/licensing/updates/check', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 403, description: 'License revoked'), new OA\Response(response: 404, description: 'Not found'), new OA\Response(response: 422, description: 'Validation error'), new OA\Response(response: 429, description: 'Too many requests')])]
    public function __invoke(CheckUpdatesRequest $request, CheckUpdatesQuery $query): JsonResponse
    {
        $validated = $request->validated();

        $result = $query->handle(
            key: (string) $validated['key'],
            installId: (string) $validated['install_id'],
            appVersion: (string) $validated['app_version'],
        );

        return (new UpdatesCheckResource($result))->toResponse($request);
    }
}
