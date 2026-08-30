<?php

declare(strict_types=1);

namespace Cms\Auth\Presentation\Http\Api\V1\Controllers\Admin;

use Cms\Auth\Application\Queries\ListProjectPermissionsQuery;
use Cms\Auth\Presentation\Http\Api\V1\Resources\Permission\PermissionResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

/** Каталог прав проекта: чекбоксы диалога роли собираются из него. */
final class PermissionController
{
    #[OA\Get(path: '/api/admin/v1/projects/{project}/permissions', operationId: 'auth_index_api_admin_v1_projects_project_permissions', tags: ['auth'], summary: 'GET /api/admin/v1/projects/{project}/permissions', security: [['bearerAuth' => []]], parameters: [new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string'))], responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 403, description: 'Forbidden')])]
    public function index(Request $request, ListProjectPermissionsQuery $query): JsonResponse
    {
        return PermissionResource::collection($query->handle($request->attributes->get('project')))->toResponse($request);
    }
}
