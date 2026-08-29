<?php

declare(strict_types=1);

namespace Cms\Content\Presentation\Http\Api\V1\Controllers\Admin;

use Cms\Content\Application\Queries\ListProjectTasksQuery;
use Cms\Content\Presentation\Http\Api\V1\Requests\Task\ListTasksRequest;
use Cms\Content\Presentation\Http\Api\V1\Resources\Task\BackgroundTaskResource;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use OpenApi\Attributes as OA;

final class TaskController
{
    #[OA\Get(
        path: '/api/admin/v1/projects/{project}/content/tasks',
        operationId: 'content_index_api_admin_v1_projects_project_content_tasks',
        tags: ['content'],
        summary: 'GET /api/admin/v1/projects/{project}/content/tasks',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'kind', in: 'query', required: false, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'subject_type', in: 'query', required: false, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'subject_id', in: 'query', required: false, schema: new OA\Schema(type: 'string')),
        ],
        responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')],
    )]
    public function index(ListTasksRequest $request, ListProjectTasksQuery $query): AnonymousResourceCollection
    {
        return BackgroundTaskResource::collection($query->handle($request->filter()));
    }
}
