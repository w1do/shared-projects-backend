<?php

declare(strict_types=1);

namespace Cms\Pay\Presentation\Http\Api\V1\Controllers\Admin;

use Cms\Pay\Application\Commands\ChangeSubscriptionCommand;
use Cms\Pay\Application\DTOs\Subscription\SubscriptionDTO;
use Cms\Pay\Application\Handlers\ChangeSubscriptionHandler;
use Cms\Pay\Application\Queries\ListSubscriptions;
use Cms\Pay\Domain\Models\Subscription;
use Cms\Shared\Http\ApiResponse;
use Cms\Shared\Http\ErrorEnvelope;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

final class SubscriptionAdminController
{
    #[OA\Get(path: '/api/admin/v1/projects/{project}/pay/subscriptions', operationId: 'pay_index_api_admin_v1_projects_project_pay_subscriptions', tags: ['pay'], summary: 'GET /api/admin/v1/projects/{project}/pay/subscriptions', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function index(ListSubscriptions $query): JsonResponse
    {
        return ApiResponse::cursorPage($query->handle(), fn (Subscription $s) => SubscriptionDTO::fromModel($s));
    }

    /** action ∈ cancel | resume | pause | delete */
    #[OA\Post(path: '/api/admin/v1/projects/{project}/pay/subscriptions/{subscription}/{action}', operationId: 'pay_change_api_admin_v1_projects_project_pay_subscriptions_subscription_action', tags: ['pay'], summary: 'POST /api/admin/v1/projects/{project}/pay/subscriptions/{subscription}/{action}', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function change(string $project, string $subscriptionId, string $action, ChangeSubscriptionHandler $handler): JsonResponse
    {
        $subscription = Subscription::query()->with('plan')->find($subscriptionId);
        if ($subscription === null) {
            return ErrorEnvelope::notFound();
        }

        return ApiResponse::data(SubscriptionDTO::fromModel(
            $handler->handle(new ChangeSubscriptionCommand($subscription, $action)),
        ));
    }
}
