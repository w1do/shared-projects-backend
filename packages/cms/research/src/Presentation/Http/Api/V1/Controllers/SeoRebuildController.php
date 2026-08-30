<?php

declare(strict_types=1);

namespace Cms\Research\Presentation\Http\Api\V1\Controllers;

use Cms\Content\Application\DTOs\Task\BackgroundTaskDTO;
use Cms\Content\Presentation\Http\Api\V1\Resources\Task\BackgroundTaskResource;
use Cms\Research\Application\Commands\RebuildSeoCommand;
use Cms\Research\Application\Handlers\StartSeoRebuildHandler;
use Cms\Research\Presentation\Http\Api\V1\Requests\RebuildSeoRequest;
use Cms\Shared\AuthClient\RequestIntrospection;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

/** Запуск пересборки SEO-полей проекта через AI. */
final class SeoRebuildController
{
    #[OA\Post(
        path: '/api/admin/v1/projects/{project}/content/seo/rebuild',
        operationId: 'content_rebuild_api_admin_v1_projects_project_content_seo_rebuild',
        tags: ['content'],
        summary: 'POST /api/admin/v1/projects/{project}/content/seo/rebuild',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
        ],
        requestBody: new OA\RequestBody(required: false, content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'entities', type: 'array', items: new OA\Items(
                    properties: [
                        new OA\Property(property: 'type', type: 'string', enum: ['post', 'page', 'category']),
                        new OA\Property(property: 'id', type: 'integer'),
                    ],
                    type: 'object',
                )),
            ],
        )),
        responses: [
            new OA\Response(response: 202, description: 'Accepted'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 422, description: 'Validation error'),
        ],
    )]
    public function store(RebuildSeoRequest $request, string $project, StartSeoRebuildHandler $handler, RequestIntrospection $introspection): JsonResponse
    {
        $task = $handler->handle(new RebuildSeoCommand(
            entities: $request->entities(),
            authorId: $introspection->actorId($request),
        ));

        return (new BackgroundTaskResource(BackgroundTaskDTO::fromModel($task)))->toResponse($request)->setStatusCode(202);
    }
}
