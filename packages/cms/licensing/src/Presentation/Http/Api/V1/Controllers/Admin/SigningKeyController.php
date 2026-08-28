<?php

declare(strict_types=1);

namespace Cms\Licensing\Presentation\Http\Api\V1\Controllers\Admin;

use Cms\Licensing\Application\Queries\GetSigningPublicKeyQuery;
use Cms\Licensing\Presentation\Http\Api\V1\Resources\SigningKey\PublicKeyResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

/** Публичный ключ подписи проекта — для встраивания в поставку (Д3). */
final class SigningKeyController
{
    #[OA\Get(path: '/api/admin/v1/projects/{project}/pay/licensing/signing-key', operationId: 'licensing_signing_key', tags: ['pay'], summary: 'GET /api/admin/v1/projects/{project}/pay/licensing/signing-key', security: [['bearerAuth' => []]], parameters: [new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string'))], responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 403, description: 'Forbidden')])]
    public function show(Request $request, string $project, GetSigningPublicKeyQuery $query): JsonResponse
    {
        return (new PublicKeyResource($query->handle()))->toResponse($request);
    }
}
