<?php

declare(strict_types=1);

namespace Cms\Auth\Presentation\Http\Api\V1\Controllers\Internal;

use Cms\Auth\Application\Commands\SetProjectProfileCommand;
use Cms\Auth\Application\Handlers\SetProjectProfileHandler;
use Cms\Auth\Presentation\Http\Api\V1\Requests\Project\ProjectProfileRequest;
use Cms\Shared\Http\ApiResponse;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

/** Content-service заполняет описание и тематику проекта результатом сборки по AI. */
final class ProjectProfileController
{
    #[OA\Post(
        path: '/internal/project-profile',
        operationId: 'auth___invoke_internal_project_profile',
        tags: ['auth'],
        summary: 'POST /internal/project-profile',
        security: [['serviceToken' => []]],
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(
            required: ['project_id'],
            properties: [
                new OA\Property(property: 'project_id', type: 'string'),
                new OA\Property(property: 'description', type: 'string', nullable: true),
                new OA\Property(property: 'topic', type: 'string', nullable: true),
                new OA\Property(property: 'overwrite', type: 'boolean'),
            ],
        )),
        responses: [new OA\Response(response: 202, description: 'Accepted'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')],
    )]
    public function __invoke(ProjectProfileRequest $request, SetProjectProfileHandler $command): JsonResponse
    {
        $validated = $request->validated();

        $command->handle(new SetProjectProfileCommand(
            projectId: (string) $validated['project_id'],
            description: isset($validated['description']) ? (string) $validated['description'] : null,
            topic: isset($validated['topic']) ? (string) $validated['topic'] : null,
            overwrite: (bool) ($validated['overwrite'] ?? false),
        ));

        return ApiResponse::accepted();
    }
}
