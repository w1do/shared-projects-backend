<?php

declare(strict_types=1);

namespace Cms\Pay\Presentation\Http\Api\V1\Controllers\Admin;

use Cms\Pay\Application\Commands\ArchivePlanCommand;
use Cms\Pay\Application\Commands\UpsertPlanCommand;
use Cms\Pay\Application\DTOs\Plan\PlanDTO;
use Cms\Pay\Application\DTOs\Plan\UpsertPlanDTO;
use Cms\Pay\Application\Handlers\ArchivePlanHandler;
use Cms\Pay\Application\Handlers\UpsertPlanHandler;
use Cms\Pay\Application\Queries\ListPlansQuery;
use Cms\Pay\Domain\Models\Plan;
use Cms\Pay\Presentation\Http\Api\V1\Requests\Plan\UpsertPlanRequest;
use Cms\Pay\Presentation\Http\Api\V1\Resources\Plan\PlanResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

final class PlanController
{
    #[OA\Get(path: '/api/admin/v1/projects/{project}/pay/plans', operationId: 'pay_index_api_admin_v1_projects_project_pay_plans', tags: ['pay'], summary: 'GET /api/admin/v1/projects/{project}/pay/plans', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function index(Request $request, ListPlansQuery $query): JsonResponse
    {
        // Непагинированная коллекция без `meta` — форма списка не меняется (И5):
        // курсор молча обрезал бы каталог до одной страницы (guard 0.6).
        return PlanResource::collection($query->handle(includeArchived: true))->toResponse($request);
    }

    #[OA\Post(
        path: '/api/admin/v1/projects/{project}/pay/plans',
        operationId: 'pay_store_api_admin_v1_projects_project_pay_plans',
        tags: ['pay'],
        summary: 'POST /api/admin/v1/projects/{project}/pay/plans',
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(
            required: ['code', 'name', 'price_minor'],
            properties: [
                new OA\Property(property: 'code', type: 'string', maxLength: 64),
                new OA\Property(property: 'name', type: 'string', maxLength: 255),
                new OA\Property(property: 'price_minor', type: 'integer', minimum: 0),
                new OA\Property(property: 'currency', type: 'string', minLength: 3, maxLength: 3),
                new OA\Property(property: 'interval', type: 'string', enum: ['day', 'month', 'year']),
                new OA\Property(property: 'options', type: 'array', items: new OA\Items),
                new OA\Property(property: 'features', type: 'array', items: new OA\Items(type: 'string', maxLength: 64)),
            ],
        )),
        responses: [new OA\Response(response: 201, description: 'Created'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')],
    )]
    public function store(UpsertPlanRequest $request, UpsertPlanHandler $handler): JsonResponse
    {
        // DTO собирается ТОЛЬКО из validated(): отсутствующий ключ остаётся
        // Optional и не превращается в null (И1).
        $plan = $handler->handle(new UpsertPlanCommand(UpsertPlanDTO::from($request->validated())));

        return (new PlanResource(PlanDTO::fromModel($plan)))->toCreatedResponse($request);
    }

    #[OA\Put(
        path: '/api/admin/v1/projects/{project}/pay/plans/{plan}',
        operationId: 'pay_update_api_admin_v1_projects_project_pay_plans_plan',
        tags: ['pay'],
        summary: 'PUT /api/admin/v1/projects/{project}/pay/plans/{plan}',
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(
            required: ['code', 'name', 'price_minor'],
            properties: [
                new OA\Property(property: 'code', type: 'string', maxLength: 64),
                new OA\Property(property: 'name', type: 'string', maxLength: 255),
                new OA\Property(property: 'price_minor', type: 'integer', minimum: 0),
                new OA\Property(property: 'currency', type: 'string', minLength: 3, maxLength: 3),
                new OA\Property(property: 'interval', type: 'string', enum: ['day', 'month', 'year']),
                new OA\Property(property: 'options', type: 'array', items: new OA\Items),
                new OA\Property(property: 'features', type: 'array', items: new OA\Items(type: 'string', maxLength: 64)),
            ],
        )),
        responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')],
    )]
    public function update(UpsertPlanRequest $request, string $project, int $planId, UpsertPlanHandler $handler): JsonResponse
    {
        // Скоуп проекта — глобальный (BelongsToProject); чужой план не находится
        // и даёт 404 тем же телом, что и прежний ручной конверт (задача 1.4).
        $plan = Plan::query()->findOrFail($planId);

        $updated = $handler->handle(new UpsertPlanCommand(UpsertPlanDTO::from($request->validated()), $plan));

        return (new PlanResource(PlanDTO::fromModel($updated)))->toResponse($request);
    }

    #[OA\Post(path: '/api/admin/v1/projects/{project}/pay/plans/{plan}/archive', operationId: 'pay_archive_api_admin_v1_projects_project_pay_plans_plan_archive', tags: ['pay'], summary: 'POST /api/admin/v1/projects/{project}/pay/plans/{plan}/archive', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function archive(Request $request, string $project, int $planId, ArchivePlanHandler $handler): JsonResponse
    {
        $plan = Plan::query()->findOrFail($planId);

        $archived = $handler->handle(new ArchivePlanCommand($plan));

        return (new PlanResource(PlanDTO::fromModel($archived)))->toResponse($request);
    }
}
