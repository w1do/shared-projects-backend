<?php

declare(strict_types=1);

namespace Cms\Licensing\Presentation\Http\Api\V1\Controllers\Admin;

use Cms\Licensing\Application\Commands\DeletePlanFeatureCommand;
use Cms\Licensing\Application\Commands\UpsertPlanFeatureCommand;
use Cms\Licensing\Application\DTOs\PlanFeature\PlanFeatureDTO;
use Cms\Licensing\Application\DTOs\PlanFeature\UpsertPlanFeatureDTO;
use Cms\Licensing\Application\Handlers\DeletePlanFeatureHandler;
use Cms\Licensing\Application\Handlers\UpsertPlanFeatureHandler;
use Cms\Licensing\Application\Queries\FindPlanFeatureQuery;
use Cms\Licensing\Application\Queries\FindPlanQuery;
use Cms\Licensing\Presentation\Http\Api\V1\Requests\PlanFeature\UpsertPlanFeatureRequest;
use Cms\Licensing\Presentation\Http\Api\V1\Resources\PlanFeature\PlanFeatureResource;
use Cms\Shared\Http\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

/** Фичи плана поставки: базовые и пер-организационные переопределения (Д4). */
final class PlanFeatureController
{
    #[OA\Post(path: '/api/admin/v1/projects/{project}/pay/licensing/plans/{plan}/features', operationId: 'licensing_store_plan_feature', tags: ['pay'], summary: 'POST /api/admin/v1/projects/{project}/pay/licensing/plans/{plan}/features', responses: [new OA\Response(response: 201, description: 'Created'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 404, description: 'Not found'), new OA\Response(response: 422, description: 'Validation error')])]
    public function store(
        UpsertPlanFeatureRequest $request,
        string $project,
        int $planId,
        FindPlanQuery $plans,
        UpsertPlanFeatureHandler $handler,
    ): JsonResponse {
        $feature = $handler->handle(new UpsertPlanFeatureCommand(
            $plans->handle($planId),
            UpsertPlanFeatureDTO::from($request->validated()),
        ));

        return (new PlanFeatureResource(PlanFeatureDTO::fromModel($feature)))->toCreatedResponse($request);
    }

    #[OA\Put(path: '/api/admin/v1/projects/{project}/pay/licensing/plans/{plan}/features/{feature}', operationId: 'licensing_update_plan_feature', tags: ['pay'], summary: 'PUT /api/admin/v1/projects/{project}/pay/licensing/plans/{plan}/features/{feature}', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 404, description: 'Not found'), new OA\Response(response: 422, description: 'Validation error')])]
    public function update(
        UpsertPlanFeatureRequest $request,
        string $project,
        int $planId,
        int $featureId,
        FindPlanQuery $plans,
        FindPlanFeatureQuery $features,
        UpsertPlanFeatureHandler $handler,
    ): JsonResponse {
        $plan = $plans->handle($planId);

        $feature = $handler->handle(new UpsertPlanFeatureCommand(
            $plan,
            UpsertPlanFeatureDTO::from($request->validated()),
            $features->handle($plan, $featureId),
        ));

        return (new PlanFeatureResource(PlanFeatureDTO::fromModel($feature)))->toResponse($request);
    }

    #[OA\Delete(path: '/api/admin/v1/projects/{project}/pay/licensing/plans/{plan}/features/{feature}', operationId: 'licensing_delete_plan_feature', tags: ['pay'], summary: 'DELETE /api/admin/v1/projects/{project}/pay/licensing/plans/{plan}/features/{feature}', responses: [new OA\Response(response: 204, description: 'No content'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 404, description: 'Not found')])]
    public function destroy(
        Request $request,
        string $project,
        int $planId,
        int $featureId,
        FindPlanQuery $plans,
        FindPlanFeatureQuery $features,
        DeletePlanFeatureHandler $handler,
    ): JsonResponse {
        $handler->handle(new DeletePlanFeatureCommand($features->handle($plans->handle($planId), $featureId)));

        return ApiResponse::noContent();
    }
}
