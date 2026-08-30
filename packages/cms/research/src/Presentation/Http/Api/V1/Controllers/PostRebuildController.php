<?php

declare(strict_types=1);

namespace Cms\Research\Presentation\Http\Api\V1\Controllers;

use Cms\Content\Application\DTOs\Task\BackgroundTaskDTO;
use Cms\Content\Presentation\Http\Api\V1\Resources\Task\BackgroundTaskResource;
use Cms\Research\Application\Commands\RebuildPostCommand;
use Cms\Research\Application\Handlers\StartPostRebuildHandler;
use Cms\Shared\AuthClient\RequestIntrospection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

/** Запуск пересборки существующего поста через AI. */
final class PostRebuildController
{
    #[OA\Post(
        path: '/api/admin/v1/projects/{project}/content/posts/{post}/rebuild',
        operationId: 'content_rebuild_api_admin_v1_projects_project_content_posts_post_rebuild',
        tags: ['content'],
        summary: 'POST /api/admin/v1/projects/{project}/content/posts/{post}/rebuild',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'post', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 202, description: 'Accepted'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 404, description: 'Not found'),
        ],
    )]
    public function store(Request $request, string $project, int $postId, StartPostRebuildHandler $handler, RequestIntrospection $introspection): JsonResponse
    {
        $task = $handler->handle(new RebuildPostCommand(
            postId: $postId,
            authorId: $introspection->actorId($request),
        ));

        return (new BackgroundTaskResource(BackgroundTaskDTO::fromModel($task)))->toResponse($request)->setStatusCode(202);
    }
}
