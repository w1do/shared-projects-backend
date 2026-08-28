<?php

declare(strict_types=1);

namespace Cms\Auth\Presentation\Http\Api\V1\Controllers\Internal;

use Cms\Auth\Application\Commands\SetTranslationsVersionCommand;
use Cms\Auth\Application\Handlers\SetTranslationsVersionHandler;
use Cms\Auth\Presentation\Http\Api\V1\Requests\Translation\TranslationsVersionRequest;
use Cms\Shared\Http\ApiResponse;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

/** Content-service сообщает новую версию переводов проекта — bootstrap отдаст её панели. */
final class TranslationsVersionController
{
    #[OA\Post(
        path: '/internal/translations-version',
        operationId: 'auth___invoke_internal_translations_version',
        tags: ['auth'],
        summary: 'POST /internal/translations-version',
        security: [['serviceToken' => []]],
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(
            required: ['project_id', 'version'],
            properties: [
                new OA\Property(property: 'project_id', type: 'string'),
                new OA\Property(property: 'version', type: 'integer', minimum: 1),
            ],
        )),
        responses: [new OA\Response(response: 202, description: 'Accepted'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')],
    )]
    public function __invoke(TranslationsVersionRequest $request, SetTranslationsVersionHandler $command): JsonResponse
    {
        $validated = $request->validated();

        $command->handle(new SetTranslationsVersionCommand(
            (string) $validated['project_id'],
            (int) $validated['version'],
        ));

        return ApiResponse::accepted();
    }
}
