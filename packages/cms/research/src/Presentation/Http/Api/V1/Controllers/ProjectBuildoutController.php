<?php

declare(strict_types=1);

namespace Cms\Research\Presentation\Http\Api\V1\Controllers;

use Cms\Research\Application\Commands\StartProjectBuildoutCommand;
use Cms\Research\Application\DTOs\Buildout\BuildoutDTO;
use Cms\Research\Application\DTOs\Buildout\StartBuildoutDTO;
use Cms\Research\Application\Handlers\StartProjectBuildoutHandler;
use Cms\Research\Application\Queries\GetBuildoutQuery;
use Cms\Research\Presentation\Http\Api\V1\Requests\StartBuildoutRequest;
use Cms\Research\Presentation\Http\Api\V1\Resources\BuildoutResource;
use Cms\Shared\AuthClient\RequestIntrospection;
use Cms\Shared\Http\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

final class ProjectBuildoutController
{
    #[OA\Get(path: '/api/admin/v1/projects/{project}/content/buildout', operationId: 'content_show_api_admin_v1_projects_project_content_buildout', tags: ['content'], summary: 'GET /api/admin/v1/projects/{project}/content/buildout', security: [['bearerAuth' => []]], parameters: [new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string'))], responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 403, description: 'Forbidden')])]
    public function show(Request $request, GetBuildoutQuery $query): JsonResponse
    {
        $buildout = $query->handle();

        return $buildout === null
            ? ApiResponse::data(null)
            : (new BuildoutResource(BuildoutDTO::fromModel($buildout)))->toResponse($request);
    }

    #[OA\Post(
        path: '/api/admin/v1/projects/{project}/content/buildout',
        operationId: 'content_store_api_admin_v1_projects_project_content_buildout',
        tags: ['content'],
        summary: 'POST /api/admin/v1/projects/{project}/content/buildout',
        security: [['bearerAuth' => []]],
        parameters: [new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string'))],
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(
            required: ['topic'],
            properties: [
                new OA\Property(property: 'topic', type: 'string', maxLength: 255),
                new OA\Property(property: 'overwrite', type: 'boolean'),
            ],
        )),
        responses: [new OA\Response(response: 201, description: 'Created'), new OA\Response(response: 422, description: 'Validation error')],
    )]
    public function store(StartBuildoutRequest $request, StartProjectBuildoutHandler $handler, RequestIntrospection $introspection): JsonResponse
    {
        $buildout = $handler->handle(new StartProjectBuildoutCommand(
            StartBuildoutDTO::fromValidated($request->validated()),
            authorId: $introspection->actorId($request),
        ));

        return (new BuildoutResource(BuildoutDTO::fromModel($buildout)))->toCreatedResponse($request);
    }
}
