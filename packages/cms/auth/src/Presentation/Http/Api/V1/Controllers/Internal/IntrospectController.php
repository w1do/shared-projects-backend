<?php

declare(strict_types=1);

namespace Cms\Auth\Presentation\Http\Api\V1\Controllers\Internal;

use Cms\Auth\Application\DTOs\Introspection\IntrospectRequestDTO;
use Cms\Auth\Application\Queries\IntrospectSubject;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;
use Spatie\LaravelData\Optional;

final class IntrospectController
{
    #[OA\Post(path: '/internal/introspect', operationId: 'auth___invoke_internal_introspect', tags: ['auth'], summary: 'POST /internal/introspect', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function __invoke(IntrospectRequestDTO $data, IntrospectSubject $query): JsonResponse
    {
        $result = ! $data->token instanceof Optional
            ? $query->token($data->token, $data->project instanceof Optional ? null : $data->project)
            : $query->apiKey($data->api_key instanceof Optional ? '' : $data->api_key);

        return new JsonResponse($result->toArray());
    }
}
