<?php

declare(strict_types=1);

namespace Cms\Research\Presentation\Http\Api\V1\Controllers;

use Cms\Research\Application\Commands\GeneratePostCommand;
use Cms\Research\Application\DTOs\Topic\TopicDTO;
use Cms\Research\Application\Handlers\StartPostGenerationHandler;
use Cms\Research\Presentation\Http\Api\V1\Requests\GeneratePostRequest;
use Cms\Research\Presentation\Http\Api\V1\Resources\TopicResource;
use Cms\Shared\AuthClient\RequestIntrospection;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

/** Запуск написания поста по выбранной теме. */
final class PostGenerationController
{
    #[OA\Post(
        path: '/api/admin/v1/projects/{project}/content/posts/generate',
        operationId: 'content_generate_api_admin_v1_projects_project_content_posts',
        tags: ['content'],
        summary: 'POST /api/admin/v1/projects/{project}/content/posts/generate',
        security: [['bearerAuth' => []]],
        parameters: [new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string'))],
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(
            required: ['topic_id'],
            properties: [new OA\Property(property: 'topic_id', type: 'integer')],
        )),
        responses: [new OA\Response(response: 202, description: 'Accepted'), new OA\Response(response: 422, description: 'Validation error')],
    )]
    public function store(GeneratePostRequest $request, StartPostGenerationHandler $handler, RequestIntrospection $introspection): JsonResponse
    {
        $topic = $handler->handle(new GeneratePostCommand(
            topicId: (int) $request->validated('topic_id'),
            authorId: $introspection->actorId($request),
        ));

        return (new TopicResource(TopicDTO::fromModel($topic)))->toResponse($request)->setStatusCode(202);
    }
}
