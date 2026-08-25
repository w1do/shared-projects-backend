<?php

declare(strict_types=1);

namespace Cms\Auth\Presentation\Http\Api\V1\Controllers\Internal;

use Cms\Auth\Infrastructure\Support\BootstrapCache;
use Cms\Shared\Http\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use OpenApi\Attributes as OA;

/** Content-service сообщает новую версию переводов проекта — bootstrap отдаст её панели. */
final class TranslationsVersionController
{
    #[OA\Post(path: '/internal/translations-version', operationId: 'auth___invoke_internal_translations_version', tags: ['auth'], summary: 'POST /internal/translations-version', responses: [new OA\Response(response: 202, description: 'Accepted'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function __invoke(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'project_id' => ['required', 'string'],
            'version' => ['required', 'integer', 'min:1'],
        ]);

        Cache::forever('translations:version:'.$validated['project_id'], (int) $validated['version']);
        BootstrapCache::bump();

        return ApiResponse::accepted();
    }
}
