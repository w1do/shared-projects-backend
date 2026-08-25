<?php

declare(strict_types=1);

namespace Cms\Auth\Presentation\Http\Api\V1\Controllers\Admin;

use Cms\Auth\Application\Commands\IssueApiKeyCommand;
use Cms\Auth\Application\Commands\RevokeApiKeyCommand;
use Cms\Auth\Application\DTOs\ApiKey\ApiKeyDTO;
use Cms\Auth\Application\DTOs\ApiKey\IssueApiKeyDTO;
use Cms\Auth\Application\Handlers\IssueApiKeyHandler;
use Cms\Auth\Application\Handlers\RevokeApiKeyHandler;
use Cms\Auth\Application\Queries\ListApiKeys;
use Cms\Auth\Domain\Models\Project;
use Cms\Shared\Http\ApiResponse;
use Cms\Shared\Http\ErrorEnvelope;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

final class ApiKeyController
{
    #[OA\Get(path: '/api/admin/v1/projects/{project}/api-keys', operationId: 'auth_index_api_admin_v1_projects_project_api_keys', tags: ['auth'], summary: 'GET /api/admin/v1/projects/{project}/api-keys', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function index(Request $request, ListApiKeys $query): JsonResponse
    {
        return ApiResponse::data($query->handle($request->attributes->get('project')));
    }

    public function store(IssueApiKeyDTO $data, Request $request, IssueApiKeyHandler $command): JsonResponse
    {
        $issued = $command->handle(new IssueApiKeyCommand($request->attributes->get('project'), $data));

        // Полный ключ возвращается ровно один раз
        return ApiResponse::created(ApiKeyDTO::issued($issued['model'], $issued['plain']));
    }

    #[OA\Delete(path: '/api/admin/v1/projects/{project}/api-keys/{key}', operationId: 'auth_destroy_api_admin_v1_projects_project_api_keys_key', tags: ['auth'], summary: 'DELETE /api/admin/v1/projects/{project}/api-keys/{key}', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function destroy(Request $request, string $project, string $keyId, RevokeApiKeyHandler $command): JsonResponse
    {
        /** @var Project $projectModel */
        $projectModel = $request->attributes->get('project');

        $key = $projectModel->apiKeys()->whereKey($keyId)->first();
        if ($key === null) {
            return ErrorEnvelope::notFound();
        }

        $command->handle(new RevokeApiKeyCommand($projectModel, $key));

        return ApiResponse::noContent();
    }
}
