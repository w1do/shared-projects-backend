<?php

declare(strict_types=1);

namespace Cms\Auth\Presentation\Http\Api\V1\Controllers\Internal;

use Cms\Auth\Application\DTOs\Introspection\IntrospectRequestDTO;
use Cms\Auth\Application\Queries\IntrospectQuery;
use Cms\Auth\Presentation\Http\Api\V1\Requests\Introspection\IntrospectRequest;
use Cms\Auth\Presentation\Http\Api\V1\Resources\Introspection\IntrospectionResource;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

final class IntrospectController
{
    #[OA\Post(
        path: '/internal/introspect',
        operationId: 'auth___invoke_internal_introspect',
        tags: ['auth'],
        summary: 'POST /internal/introspect',
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'token', type: 'string'),
                new OA\Property(property: 'api_key', type: 'string'),
                new OA\Property(property: 'project', type: 'string'),
            ],
        )),
        responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')],
    )]
    public function __invoke(IntrospectRequest $request, IntrospectQuery $query): JsonResponse
    {
        $result = $query->handle(IntrospectRequestDTO::from($request->validated()));

        return (new IntrospectionResource($result))->toResponse($request);
    }
}
