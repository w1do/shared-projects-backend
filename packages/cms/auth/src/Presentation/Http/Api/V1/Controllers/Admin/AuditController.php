<?php

declare(strict_types=1);

namespace Cms\Auth\Presentation\Http\Api\V1\Controllers\Admin;

use Cms\Auth\Application\Queries\ListAuditEntriesQuery;
use Cms\Auth\Presentation\Http\Api\V1\Resources\Audit\AuditEntryCollection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

final class AuditController
{
    #[OA\Get(
        path: '/api/admin/v1/projects/{project}/audit',
        operationId: 'auth_index_api_admin_v1_projects_project_audit',
        tags: ['auth'],
        summary: 'GET /api/admin/v1/projects/{project}/audit',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'cursor', in: 'query', required: false, schema: new OA\Schema(type: 'string')),
        ],
        responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')],
    )]
    public function index(Request $request, ListAuditEntriesQuery $query): JsonResponse
    {
        return (new AuditEntryCollection($query->handle($request->attributes->get('project'))))->toResponse($request);
    }
}
