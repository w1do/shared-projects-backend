<?php

declare(strict_types=1);

namespace Cms\Auth\Presentation\Http\Api\V1\Controllers\Admin;

use Cms\Auth\Application\Commands\IssueApiKeyCommand;
use Cms\Auth\Application\Commands\RevokeApiKeyCommand;
use Cms\Auth\Application\DTOs\ApiKey\ApiKeyDTO;
use Cms\Auth\Application\DTOs\ApiKey\IssueApiKeyDTO;
use Cms\Auth\Application\Handlers\IssueApiKeyHandler;
use Cms\Auth\Application\Handlers\RevokeApiKeyHandler;
use Cms\Auth\Application\Queries\ListApiKeysQuery;
use Cms\Auth\Domain\Models\Project;
use Cms\Auth\Domain\Models\ProjectApiKey;
use Cms\Auth\Presentation\Http\Api\V1\Requests\ApiKey\IssueApiKeyRequest;
use Cms\Auth\Presentation\Http\Api\V1\Resources\ApiKey\ApiKeyResource;
use Cms\Shared\Http\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

final class ApiKeyController
{
    #[OA\Get(path: '/api/admin/v1/projects/{project}/api-keys', operationId: 'auth_index_api_admin_v1_projects_project_api_keys', tags: ['auth'], summary: 'GET /api/admin/v1/projects/{project}/api-keys', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function index(Request $request, ListApiKeysQuery $query): JsonResponse
    {
        return ApiKeyResource::collection($query->handle($request->attributes->get('project')))->toResponse($request);
    }

    public function store(IssueApiKeyRequest $request, IssueApiKeyHandler $command): JsonResponse
    {
        $issued = $command->handle(new IssueApiKeyCommand(
            $request->attributes->get('project'),
            IssueApiKeyDTO::from($request->validated()),
        ));

        // Полный ключ возвращается ровно один раз
        return (new ApiKeyResource(ApiKeyDTO::issued($issued['model'], $issued['plain'])))->toCreatedResponse($request);
    }

    #[OA\Delete(path: '/api/admin/v1/projects/{project}/api-keys/{key}', operationId: 'auth_destroy_api_admin_v1_projects_project_api_keys_key', tags: ['auth'], summary: 'DELETE /api/admin/v1/projects/{project}/api-keys/{key}', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function destroy(Request $request, string $project, string $keyId, RevokeApiKeyHandler $command): JsonResponse
    {
        /** @var Project $projectModel */
        $projectModel = $request->attributes->get('project');

        /** @var ProjectApiKey $key Ключ ищется в скоупе проекта: чужой даёт 404 (И11) */
        $key = $projectModel->apiKeys()->whereKey($keyId)->firstOrFail();

        $command->handle(new RevokeApiKeyCommand($projectModel, $key));

        return ApiResponse::noContent();
    }
}
