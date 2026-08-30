<?php

declare(strict_types=1);

namespace Cms\Research\Presentation\Http\Api\V1\Controllers;

use Cms\Content\Application\DTOs\Task\BackgroundTaskDTO;
use Cms\Content\Presentation\Http\Api\V1\Resources\Task\BackgroundTaskResource;
use Cms\Research\Application\Commands\AdaptCitySeoCommand;
use Cms\Research\Application\Handlers\StartCitySeoAdaptationHandler;
use Cms\Research\Presentation\Http\Api\V1\Requests\AdaptCitySeoRequest;
use Cms\Shared\AuthClient\RequestIntrospection;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

/** Запуск адаптации SEO включённых городов проекта под его тематику. */
final class CitySeoAdaptationController
{
    #[OA\Post(
        path: '/api/admin/v1/projects/{project}/content/cities/adapt-seo',
        operationId: 'content_adapt_seo_api_admin_v1_projects_project_content_cities_adapt_seo',
        tags: ['content'],
        summary: 'POST /api/admin/v1/projects/{project}/content/cities/adapt-seo',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
        ],
        requestBody: new OA\RequestBody(required: false, content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'topic', type: 'string', maxLength: 255, nullable: true, description: 'Тематика запуска; без неё берётся тематика проекта'),
            ],
        )),
        responses: [
            new OA\Response(response: 202, description: 'Accepted'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 422, description: 'Validation error'),
        ],
    )]
    public function store(
        AdaptCitySeoRequest $request,
        string $project,
        StartCitySeoAdaptationHandler $handler,
        RequestIntrospection $introspection,
    ): JsonResponse {
        $task = $handler->handle(new AdaptCitySeoCommand(
            topic: $request->topic(),
            authorId: $introspection->actorId($request),
        ));

        return (new BackgroundTaskResource(BackgroundTaskDTO::fromModel($task)))->toResponse($request)->setStatusCode(202);
    }
}
