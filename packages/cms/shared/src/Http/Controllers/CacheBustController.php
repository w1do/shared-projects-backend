<?php

declare(strict_types=1);

namespace Cms\Shared\Http\Controllers;

use Cms\Shared\Cache\CacheBustHandler;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

/**
 * POST /internal/cache-bust — плоский ответ `{"flushed": true}` без конверта `data`:
 * это контракт межсервисного вызова (Safety Protocol, И3/Б2), не публичного API.
 */
final class CacheBustController
{
    #[OA\Post(path: '/internal/cache-bust', operationId: 'shared_cache_bust_internal_cache_bust', tags: ['auth'], summary: 'POST /internal/cache-bust', security: [['serviceToken' => []]], responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated')])]
    public function __invoke(CacheBustHandler $handler): JsonResponse
    {
        $handler->handle();

        return new JsonResponse(['flushed' => true]);
    }
}
