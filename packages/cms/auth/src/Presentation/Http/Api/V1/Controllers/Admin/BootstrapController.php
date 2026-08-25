<?php

declare(strict_types=1);

namespace Cms\Auth\Presentation\Http\Api\V1\Controllers\Admin;

use Cms\Auth\Application\Queries\BuildBootstrap;
use Cms\Auth\Domain\Models\Admin;
use Cms\Shared\Http\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

final class BootstrapController
{
    #[OA\Get(path: '/api/admin/v1/bootstrap', operationId: 'auth___invoke_api_admin_v1_bootstrap', tags: ['auth'], summary: 'GET /api/admin/v1/bootstrap', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function __invoke(Request $request, BuildBootstrap $query): JsonResponse
    {
        /** @var Admin $admin */
        $admin = $request->user('admin');
        $project = $request->query('project');

        return ApiResponse::data($query->handle($admin, is_string($project) ? $project : null));
    }
}
