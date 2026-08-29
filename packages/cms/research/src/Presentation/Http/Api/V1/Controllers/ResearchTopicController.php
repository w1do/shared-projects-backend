<?php

declare(strict_types=1);

namespace Cms\Research\Presentation\Http\Api\V1\Controllers;

use Cms\Research\Application\Commands\ExtractTopicsCommand;
use Cms\Research\Application\Commands\RejectTopicCommand;
use Cms\Research\Application\DTOs\Topic\TopicDTO;
use Cms\Research\Application\Handlers\ExtractTopicsHandler;
use Cms\Research\Application\Handlers\RejectTopicHandler;
use Cms\Research\Application\Queries\ListTopicsQuery;
use Cms\Research\Presentation\Http\Api\V1\Requests\ExtractTopicsRequest;
use Cms\Research\Presentation\Http\Api\V1\Requests\ListTopicsRequest;
use Cms\Research\Presentation\Http\Api\V1\Resources\TopicResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

final class ResearchTopicController
{
    #[OA\Get(path: '/api/admin/v1/projects/{project}/content/research/{research}/topics', operationId: 'content_index_api_admin_v1_projects_project_content_research_research_topics', tags: ['content'], summary: 'GET /api/admin/v1/projects/{project}/content/research/{research}/topics', security: [['bearerAuth' => []]], parameters: [new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string')), new OA\Parameter(name: 'research', in: 'path', required: true, schema: new OA\Schema(type: 'integer')), new OA\Parameter(name: 'status', in: 'query', required: false, schema: new OA\Schema(type: 'string'))], responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 403, description: 'Forbidden')])]
    public function index(ListTopicsRequest $request, ListTopicsQuery $query): JsonResponse
    {
        $status = $request->validated('status');

        return TopicResource::collection($query->handle($this->researchId($request), is_string($status) ? $status : null))
            ->toResponse($request);
    }

    #[OA\Get(path: '/api/admin/v1/projects/{project}/content/topics', operationId: 'content_all_api_admin_v1_projects_project_content_topics', tags: ['content'], summary: 'GET /api/admin/v1/projects/{project}/content/topics', security: [['bearerAuth' => []]], parameters: [new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string')), new OA\Parameter(name: 'status', in: 'query', required: false, schema: new OA\Schema(type: 'string'))], responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 403, description: 'Forbidden')])]
    public function all(ListTopicsRequest $request, ListTopicsQuery $query): JsonResponse
    {
        $status = $request->validated('status');

        return TopicResource::collection($query->handle(null, is_string($status) ? $status : null))
            ->toResponse($request);
    }

    #[OA\Post(
        path: '/api/admin/v1/projects/{project}/content/research/{research}/topics',
        operationId: 'content_store_api_admin_v1_projects_project_content_research_research_topics',
        tags: ['content'],
        summary: 'POST /api/admin/v1/projects/{project}/content/research/{research}/topics',
        security: [['bearerAuth' => []]],
        parameters: [new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string')), new OA\Parameter(name: 'research', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
        requestBody: new OA\RequestBody(required: false, content: new OA\JsonContent(
            properties: [new OA\Property(property: 'max_count', type: 'integer', nullable: true)],
        )),
        responses: [new OA\Response(response: 201, description: 'Created'), new OA\Response(response: 422, description: 'Validation error')],
    )]
    public function store(ExtractTopicsRequest $request, ExtractTopicsHandler $handler, ListTopicsQuery $query): JsonResponse
    {
        $maxCount = $request->validated('max_count');

        $handler->handle(new ExtractTopicsCommand(
            researchId: $this->researchId($request),
            maxCount: is_numeric($maxCount) ? (int) $maxCount : null,
        ));

        // Возвращается весь набор тем исследования: повторное извлечение
        // добавляет новые, а прежние сохраняют своё состояние.
        return TopicResource::collection($query->handle($this->researchId($request)))
            ->toResponse($request)
            ->setStatusCode(201);
    }

    #[OA\Post(path: '/api/admin/v1/projects/{project}/content/topics/{topic}/reject', operationId: 'content_reject_api_admin_v1_projects_project_content_topics_topic', tags: ['content'], summary: 'POST /api/admin/v1/projects/{project}/content/topics/{topic}/reject', security: [['bearerAuth' => []]], parameters: [new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string')), new OA\Parameter(name: 'topic', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))], responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 422, description: 'Validation error')])]
    public function reject(Request $request, RejectTopicHandler $handler): JsonResponse
    {
        $topic = $handler->handle(new RejectTopicCommand((int) $request->route('topic')));

        return (new TopicResource(TopicDTO::fromModel($topic)))->toResponse($request);
    }

    private function researchId(Request $request): int
    {
        return (int) $request->route('research');
    }
}
