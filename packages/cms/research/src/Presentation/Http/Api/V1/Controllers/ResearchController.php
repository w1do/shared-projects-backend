<?php

declare(strict_types=1);

namespace Cms\Research\Presentation\Http\Api\V1\Controllers;

use Cms\Research\Application\Commands\CancelResearchCommand;
use Cms\Research\Application\Commands\StartResearchCommand;
use Cms\Research\Application\DTOs\Research\ResearchDTO;
use Cms\Research\Application\DTOs\Research\StartResearchDTO;
use Cms\Research\Application\Handlers\CancelResearchHandler;
use Cms\Research\Application\Handlers\StartResearchHandler;
use Cms\Research\Application\Queries\GetResearchQuery;
use Cms\Research\Application\Queries\ListResearchesQuery;
use Cms\Research\Presentation\Http\Api\V1\Requests\ListResearchesRequest;
use Cms\Research\Presentation\Http\Api\V1\Requests\StartResearchRequest;
use Cms\Research\Presentation\Http\Api\V1\Resources\ResearchResource;
use Cms\Shared\AuthClient\RequestIntrospection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

final class ResearchController
{
    #[OA\Get(path: '/api/admin/v1/projects/{project}/content/research', operationId: 'content_index_api_admin_v1_projects_project_content_research', tags: ['content'], summary: 'GET /api/admin/v1/projects/{project}/content/research', security: [['bearerAuth' => []]], parameters: [new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string')), new OA\Parameter(name: 'status', in: 'query', required: false, schema: new OA\Schema(type: 'string'))], responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 403, description: 'Forbidden')])]
    public function index(ListResearchesRequest $request, ListResearchesQuery $query): JsonResponse
    {
        $status = $request->validated('status');

        return ResearchResource::collection($query->handle(is_string($status) ? $status : null))
            ->toResponse($request);
    }

    #[OA\Get(path: '/api/admin/v1/projects/{project}/content/research/{research}', operationId: 'content_show_api_admin_v1_projects_project_content_research_research', tags: ['content'], summary: 'GET /api/admin/v1/projects/{project}/content/research/{research}', security: [['bearerAuth' => []]], parameters: [new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string')), new OA\Parameter(name: 'research', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))], responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 404, description: 'Not found')])]
    public function show(Request $request, GetResearchQuery $query): JsonResponse
    {
        $research = $query->handle($this->researchId($request), withSources: true);

        return (new ResearchResource(ResearchDTO::fromModel($research, withSources: true)))->toResponse($request);
    }

    #[OA\Post(
        path: '/api/admin/v1/projects/{project}/content/research',
        operationId: 'content_store_api_admin_v1_projects_project_content_research',
        tags: ['content'],
        summary: 'POST /api/admin/v1/projects/{project}/content/research',
        security: [['bearerAuth' => []]],
        parameters: [new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string'))],
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(
            required: ['query'],
            properties: [
                new OA\Property(property: 'query', type: 'string', maxLength: 255),
                new OA\Property(property: 'offer', type: 'string', maxLength: 2000, nullable: true),
                new OA\Property(property: 'engine', type: 'string', nullable: true),
                new OA\Property(property: 'sub_queries_count', type: 'integer', nullable: true),
                new OA\Property(property: 'results_per_sub_query', type: 'integer', nullable: true),
            ],
        )),
        responses: [new OA\Response(response: 201, description: 'Created'), new OA\Response(response: 422, description: 'Validation error')],
    )]
    public function store(StartResearchRequest $request, StartResearchHandler $handler, RequestIntrospection $introspection): JsonResponse
    {
        $research = $handler->handle(new StartResearchCommand(
            StartResearchDTO::fromValidated($request->validated()),
            authorId: $introspection->actorId($request),
        ));

        return (new ResearchResource(ResearchDTO::fromModel($research)))->toCreatedResponse($request);
    }

    #[OA\Post(path: '/api/admin/v1/projects/{project}/content/research/{research}/cancel', operationId: 'content_cancel_api_admin_v1_projects_project_content_research_research', tags: ['content'], summary: 'POST /api/admin/v1/projects/{project}/content/research/{research}/cancel', security: [['bearerAuth' => []]], parameters: [new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string')), new OA\Parameter(name: 'research', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))], responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 404, description: 'Not found')])]
    public function cancel(Request $request, CancelResearchHandler $handler): JsonResponse
    {
        $research = $handler->handle(new CancelResearchCommand($this->researchId($request)));

        return (new ResearchResource(ResearchDTO::fromModel($research)))->toResponse($request);
    }

    /** id из сегмента {research}: route-параметры подставляются позиционно. */
    private function researchId(Request $request): int
    {
        return (int) $request->route('research');
    }
}
