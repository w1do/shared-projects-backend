<?php

declare(strict_types=1);

namespace Cms\Pay\Presentation\Http\Api\V1\Controllers\Site;

use Cms\Pay\Application\Queries\ListPlans;
use Cms\Shared\Http\ApiResponse;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

/** Публичный каталог активных планов с опциями и возможностями. */
final class CatalogController
{
    #[OA\Get(path: '/api/v1/pay/plans', operationId: 'pay_plans_api_v1_pay_plans', tags: ['pay'], summary: 'GET /api/v1/pay/plans', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function plans(ListPlans $query): JsonResponse
    {
        return ApiResponse::data($query->handle(includeArchived: false));
    }
}
