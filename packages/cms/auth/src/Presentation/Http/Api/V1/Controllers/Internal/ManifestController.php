<?php

declare(strict_types=1);

namespace Cms\Auth\Presentation\Http\Api\V1\Controllers\Internal;

use Cms\Auth\Application\Commands\PublishManifestCommand;
use Cms\Auth\Application\DTOs\Manifest\PublishedManifestDTO;
use Cms\Auth\Application\Handlers\PublishManifestHandler;
use Cms\Auth\Presentation\Http\Api\V1\Requests\Manifest\PublishManifestRequest;
use Cms\Auth\Presentation\Http\Api\V1\Resources\Manifest\PublishedManifestResource;
use Cms\Contracts\Manifest\ServiceManifest;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

final class ManifestController
{
    #[OA\Post(
        path: '/internal/manifests',
        operationId: 'auth_store_internal_manifests',
        tags: ['auth'],
        summary: 'POST /internal/manifests',
        security: [['serviceToken' => []]],
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(
            required: ['key', 'version'],
            properties: [
                new OA\Property(property: 'key', type: 'string', maxLength: 32),
                new OA\Property(property: 'version', type: 'string', maxLength: 32),
            ],
        )),
        responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')],
    )]
    public function store(PublishManifestRequest $request, PublishManifestHandler $command): JsonResponse
    {
        $manifest = ServiceManifest::fromArray($request->manifestPayload());
        $record = $command->handle(new PublishManifestCommand($manifest));

        return (new PublishedManifestResource(PublishedManifestDTO::fromModel($record)))->toResponse($request);
    }
}
