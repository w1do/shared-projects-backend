<?php

declare(strict_types=1);

namespace Cms\Licensing\Presentation\Http\Api\V1\Controllers\Admin;

use Cms\Licensing\Application\Commands\DeletePlanCommand;
use Cms\Licensing\Application\Commands\UpsertPlanCommand;
use Cms\Licensing\Application\DTOs\Plan\PlanDTO;
use Cms\Licensing\Application\DTOs\Plan\UpsertPlanDTO;
use Cms\Licensing\Application\Handlers\DeletePlanHandler;
use Cms\Licensing\Application\Handlers\UpsertPlanHandler;
use Cms\Licensing\Application\Queries\FindPlanQuery;
use Cms\Licensing\Application\Queries\ListPlansQuery;
use Cms\Licensing\Presentation\Http\Api\V1\Requests\Plan\UpsertPlanRequest;
use Cms\Licensing\Presentation\Http\Api\V1\Resources\Plan\PlanCursorCollection;
use Cms\Licensing\Presentation\Http\Api\V1\Resources\Plan\PlanResource;
use Cms\Shared\Http\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

/** Планы лицензионной поставки: admin CRUD. */
final class PlanController
{
    #[OA\Get(
        path: '/api/admin/v1/projects/{project}/pay/licensing/plans',
        operationId: 'licensing_index_plans',
        tags: ['pay'],
        summary: 'GET /api/admin/v1/projects/{project}/pay/licensing/plans',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'cursor', in: 'query', required: false, schema: new OA\Schema(type: 'string')),
        ],
        responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 403, description: 'Forbidden')],
    )]
    public function index(Request $request, ListPlansQuery $query): JsonResponse
    {
        return (new PlanCursorCollection($query->handle()))->toResponse($request);
    }

    #[OA\Get(
        path: '/api/admin/v1/projects/{project}/pay/licensing/plans/{plan}',
        operationId: 'licensing_show_plan',
        tags: ['pay'],
        summary: 'GET /api/admin/v1/projects/{project}/pay/licensing/plans/{plan}',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'plan', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 404, description: 'Not found')],
    )]
    public function show(Request $request, string $project, int $planId, FindPlanQuery $plans): JsonResponse
    {
        return (new PlanResource(PlanDTO::fromModel($plans->handle($planId))))->toResponse($request);
    }

    #[OA\Post(
        path: '/api/admin/v1/projects/{project}/pay/licensing/plans',
        operationId: 'licensing_store_plan',
        tags: ['pay'],
        summary: 'POST /api/admin/v1/projects/{project}/pay/licensing/plans',
        security: [['bearerAuth' => []]],
        parameters: [new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string'))],
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(
            required: ['code', 'name'],
            properties: [
                new OA\Property(property: 'code', type: 'string', maxLength: 64),
                new OA\Property(property: 'name', type: 'string', maxLength: 255),
                new OA\Property(property: 'price_minor', type: 'integer', minimum: 0, nullable: true),
                new OA\Property(property: 'currency', type: 'string', minLength: 3, maxLength: 3, nullable: true),
                new OA\Property(property: 'interval', type: 'string', enum: ['day', 'month', 'year'], nullable: true),
            ],
        )),
        responses: [new OA\Response(response: 201, description: 'Created'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')],
    )]
    public function store(UpsertPlanRequest $request, UpsertPlanHandler $handler): JsonResponse
    {
        $plan = $handler->handle(new UpsertPlanCommand(UpsertPlanDTO::from($request->validated())));

        return (new PlanResource(PlanDTO::fromModel($plan)))->toCreatedResponse($request);
    }

    #[OA\Put(
        path: '/api/admin/v1/projects/{project}/pay/licensing/plans/{plan}',
        operationId: 'licensing_update_plan',
        tags: ['pay'],
        summary: 'PUT /api/admin/v1/projects/{project}/pay/licensing/plans/{plan}',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'plan', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(
            required: ['code', 'name'],
            properties: [
                new OA\Property(property: 'code', type: 'string', maxLength: 64),
                new OA\Property(property: 'name', type: 'string', maxLength: 255),
                new OA\Property(property: 'price_minor', type: 'integer', minimum: 0, nullable: true),
                new OA\Property(property: 'currency', type: 'string', minLength: 3, maxLength: 3, nullable: true),
                new OA\Property(property: 'interval', type: 'string', enum: ['day', 'month', 'year'], nullable: true),
            ],
        )),
        responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 404, description: 'Not found'), new OA\Response(response: 422, description: 'Validation error')],
    )]
    public function update(
        UpsertPlanRequest $request,
        string $project,
        int $planId,
        FindPlanQuery $plans,
        UpsertPlanHandler $handler,
    ): JsonResponse {
        $plan = $handler->handle(new UpsertPlanCommand(
            UpsertPlanDTO::from($request->validated()),
            $plans->handle($planId),
        ));

        return (new PlanResource(PlanDTO::fromModel($plan)))->toResponse($request);
    }

    #[OA\Delete(
        path: '/api/admin/v1/projects/{project}/pay/licensing/plans/{plan}',
        operationId: 'licensing_delete_plan',
        tags: ['pay'],
        summary: 'DELETE /api/admin/v1/projects/{project}/pay/licensing/plans/{plan}',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'plan', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [new OA\Response(response: 204, description: 'No content'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 404, description: 'Not found'), new OA\Response(response: 422, description: 'Validation error')],
    )]
    public function destroy(
        Request $request,
        string $project,
        int $planId,
        FindPlanQuery $plans,
        DeletePlanHandler $handler,
    ): JsonResponse {
        $handler->handle(new DeletePlanCommand($plans->handle($planId)));

        return ApiResponse::noContent();
    }
}
