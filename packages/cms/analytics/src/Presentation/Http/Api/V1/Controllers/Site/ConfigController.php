<?php

declare(strict_types=1);

namespace Cms\Analytics\Presentation\Http\Api\V1\Controllers\Site;

use Cms\Analytics\Application\Queries\GetAnalyticsSettingsQuery;
use Cms\Analytics\Presentation\Http\Api\V1\Resources\Settings\AnalyticsConfigResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

/** Публичный конфиг счётчиков: сайт проекта читает его для инъекции скриптов аналитики. */
final class ConfigController
{
    #[OA\Get(path: '/api/v1/analytics/config', operationId: 'analytics_config_api_v1_analytics_config', tags: ['analytics'], summary: 'GET /api/v1/analytics/config', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated')])]
    public function __invoke(Request $request, GetAnalyticsSettingsQuery $query): JsonResponse
    {
        return (new AnalyticsConfigResource($query->handle()))->toResponse($request);
    }
}
