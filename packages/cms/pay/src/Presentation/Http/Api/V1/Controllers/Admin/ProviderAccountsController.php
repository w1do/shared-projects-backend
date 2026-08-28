<?php

declare(strict_types=1);

namespace Cms\Pay\Presentation\Http\Api\V1\Controllers\Admin;

use Cms\Pay\Application\Commands\UpsertProviderAccountCommand;
use Cms\Pay\Application\DTOs\ProviderAccount\UpsertProviderAccountDTO;
use Cms\Pay\Application\Handlers\UpsertProviderAccountHandler;
use Cms\Pay\Application\Queries\GetProviderAccountQuery;
use Cms\Pay\Application\Queries\ListProviderAccountsQuery;
use Cms\Pay\Presentation\Http\Api\V1\Requests\ProviderAccount\UpsertProviderAccountRequest;
use Cms\Pay\Presentation\Http\Api\V1\Resources\ProviderAccount\ProviderAccountListItemResource;
use Cms\Pay\Presentation\Http\Api\V1\Resources\ProviderAccount\ProviderAccountResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

/** Настройки внешних провайдеров проекта: список, просмотр, upsert (Д3). */
final class ProviderAccountsController
{
    #[OA\Get(path: '/api/admin/v1/projects/{project}/pay/providers', operationId: 'pay_index_api_admin_v1_projects_project_pay_providers', tags: ['pay'], summary: 'GET /api/admin/v1/projects/{project}/pay/providers', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 403, description: 'Forbidden')])]
    public function index(Request $request, ListProviderAccountsQuery $query): JsonResponse
    {
        return ProviderAccountListItemResource::collection($query->handle())->toResponse($request);
    }

    #[OA\Get(path: '/api/admin/v1/projects/{project}/pay/providers/{provider}', operationId: 'pay_show_api_admin_v1_projects_project_pay_providers_provider', tags: ['pay'], summary: 'GET /api/admin/v1/projects/{project}/pay/providers/{provider}', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 403, description: 'Forbidden'), new OA\Response(response: 422, description: 'Validation error')])]
    public function show(Request $request, string $project, string $provider, GetProviderAccountQuery $query): JsonResponse
    {
        return (new ProviderAccountResource($query->handle($provider)))->toResponse($request);
    }

    #[OA\Put(
        path: '/api/admin/v1/projects/{project}/pay/providers/{provider}',
        operationId: 'pay_update_api_admin_v1_projects_project_pay_providers_provider',
        tags: ['pay'],
        summary: 'PUT /api/admin/v1/projects/{project}/pay/providers/{provider}',
        requestBody: new OA\RequestBody(required: false, content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'group', type: 'string', maxLength: 32),
                new OA\Property(property: 'label', type: 'string', maxLength: 255, nullable: true),
                new OA\Property(property: 'name', type: 'string', maxLength: 255, nullable: true),
                new OA\Property(property: 'credentials', type: 'object'),
                new OA\Property(property: 'properties', type: 'object'),
                new OA\Property(property: 'return_url', type: 'string', format: 'uri', maxLength: 255, nullable: true),
                new OA\Property(property: 'fail_url', type: 'string', format: 'uri', maxLength: 255, nullable: true),
                new OA\Property(property: 'status', type: 'string', enum: ['active', 'archived']),
            ],
        )),
        responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 403, description: 'Forbidden'), new OA\Response(response: 422, description: 'Validation error')],
    )]
    public function update(UpsertProviderAccountRequest $request, string $project, string $provider, UpsertProviderAccountHandler $handler): JsonResponse
    {
        // DTO собирается ТОЛЬКО из validated(): отсутствующий ключ остаётся Optional (И1)
        $saved = $handler->handle(new UpsertProviderAccountCommand(UpsertProviderAccountDTO::from($request->validated())));

        return (new ProviderAccountResource($saved))->toResponse($request);
    }
}
