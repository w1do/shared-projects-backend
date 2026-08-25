<?php

declare(strict_types=1);

namespace Cms\Pay\Presentation\Http\Api\V1\Controllers\Admin;

use Cms\Pay\Application\Commands\ArchivePlanCommand;
use Cms\Pay\Application\Commands\UpsertPlanCommand;
use Cms\Pay\Application\DTOs\Plan\PlanDTO;
use Cms\Pay\Application\DTOs\Plan\UpsertPlanDTO;
use Cms\Pay\Application\Handlers\ArchivePlanHandler;
use Cms\Pay\Application\Handlers\UpsertPlanHandler;
use Cms\Pay\Application\Queries\ListPlans;
use Cms\Pay\Domain\Models\Plan;
use Cms\Shared\Http\ApiResponse;
use Cms\Shared\Http\ErrorEnvelope;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

final class PlanController
{
    #[OA\Get(path: '/api/admin/v1/projects/{project}/pay/plans', operationId: 'pay_index_api_admin_v1_projects_project_pay_plans', tags: ['pay'], summary: 'GET /api/admin/v1/projects/{project}/pay/plans', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function index(ListPlans $query): JsonResponse
    {
        return ApiResponse::data($query->handle(includeArchived: true));
    }

    public function store(UpsertPlanDTO $data, UpsertPlanHandler $handler): JsonResponse
    {
        return ApiResponse::created(PlanDTO::fromModel($handler->handle(new UpsertPlanCommand($data))));
    }

    #[OA\Put(path: '/api/admin/v1/projects/{project}/pay/plans/{plan}', operationId: 'pay_update_api_admin_v1_projects_project_pay_plans_plan', tags: ['pay'], summary: 'PUT /api/admin/v1/projects/{project}/pay/plans/{plan}', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function update(UpsertPlanDTO $data, string $project, int $planId, UpsertPlanHandler $handler): JsonResponse
    {
        $plan = Plan::query()->find($planId);
        if ($plan === null) {
            return ErrorEnvelope::notFound();
        }

        return ApiResponse::data(PlanDTO::fromModel($handler->handle(new UpsertPlanCommand($data, $plan))));
    }

    #[OA\Post(path: '/api/admin/v1/projects/{project}/pay/plans/{plan}/archive', operationId: 'pay_archive_api_admin_v1_projects_project_pay_plans_plan_archive', tags: ['pay'], summary: 'POST /api/admin/v1/projects/{project}/pay/plans/{plan}/archive', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function archive(string $project, int $planId, ArchivePlanHandler $handler): JsonResponse
    {
        $plan = Plan::query()->find($planId);
        if ($plan === null) {
            return ErrorEnvelope::notFound();
        }

        return ApiResponse::data(PlanDTO::fromModel($handler->handle(new ArchivePlanCommand($plan))));
    }
}
