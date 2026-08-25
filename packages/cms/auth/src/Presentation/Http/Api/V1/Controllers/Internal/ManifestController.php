<?php

declare(strict_types=1);

namespace Cms\Auth\Presentation\Http\Api\V1\Controllers\Internal;

use Cms\Auth\Application\Commands\PublishManifestCommand;
use Cms\Auth\Application\Handlers\PublishManifestHandler;
use Cms\Contracts\Manifest\ServiceManifest;
use Cms\Shared\Http\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

final class ManifestController
{
    #[OA\Post(path: '/internal/manifests', operationId: 'auth_store_internal_manifests', tags: ['auth'], summary: 'POST /internal/manifests', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function store(Request $request, PublishManifestHandler $command): JsonResponse
    {
        $request->validate([
            'key' => ['required', 'string', 'max:32', 'alpha_dash'],
            'version' => ['required', 'string', 'max:32'],
        ]);

        $record = $command->handle(new PublishManifestCommand(ServiceManifest::fromArray($request->all())));

        return ApiResponse::data(['key' => $record->key, 'version' => $record->version]);
    }
}
