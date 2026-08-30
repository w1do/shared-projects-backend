<?php

declare(strict_types=1);

namespace Cms\Pay\Presentation\Http\Api\V1\Controllers\Admin;

use Cms\Pay\Application\Commands\ChangeSubscriptionCommand;
use Cms\Pay\Application\Commands\SubscribeCommand;
use Cms\Pay\Application\DTOs\Subscription\AdminSubscribeDTO;
use Cms\Pay\Application\DTOs\Subscription\SubscriptionDTO;
use Cms\Pay\Application\Handlers\ChangeSubscriptionHandler;
use Cms\Pay\Application\Handlers\SubscribeHandler;
use Cms\Pay\Application\Queries\FindSubscriberQuery;
use Cms\Pay\Application\Queries\FindSubscriptionSubjectQuery;
use Cms\Pay\Application\Queries\ListSubscriptionsQuery;
use Cms\Pay\Domain\Enums\SubscriptionAction;
use Cms\Pay\Domain\Models\Subscription;
use Cms\Pay\Presentation\Http\Api\V1\Requests\Subscription\AdminSubscribeRequest;
use Cms\Pay\Presentation\Http\Api\V1\Requests\Subscription\ListSubscriptionsRequest;
use Cms\Pay\Presentation\Http\Api\V1\Resources\Subscription\SubscriptionCheckoutResource;
use Cms\Pay\Presentation\Http\Api\V1\Resources\Subscription\SubscriptionCursorCollection;
use Cms\Pay\Presentation\Http\Api\V1\Resources\Subscription\SubscriptionResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;
use Spatie\LaravelData\Optional;

final class SubscriptionAdminController
{
    /** Оформление подписки оператором: полиморфные подписчик и предмет (Д16). */
    #[OA\Post(
        path: '/api/admin/v1/projects/{project}/pay/subscriptions',
        operationId: 'pay_store_api_admin_v1_projects_project_pay_subscriptions',
        tags: ['pay'],
        summary: 'POST /api/admin/v1/projects/{project}/pay/subscriptions',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
        ],
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(
            required: ['subscriber_type', 'subscriber_id', 'subject_type', 'subject_id'],
            properties: [
                new OA\Property(property: 'subscriber_type', type: 'string', maxLength: 32),
                new OA\Property(property: 'subscriber_id', type: 'string', maxLength: 64),
                new OA\Property(property: 'subject_type', type: 'string', maxLength: 32),
                new OA\Property(property: 'subject_id', type: 'string', maxLength: 64),
                new OA\Property(property: 'provider', type: 'string', maxLength: 32),
            ],
        )),
        responses: [new OA\Response(response: 201, description: 'Created'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 403, description: 'Forbidden'), new OA\Response(response: 422, description: 'Validation error')],
    )]
    public function store(
        AdminSubscribeRequest $request,
        FindSubscriberQuery $subscribers,
        FindSubscriptionSubjectQuery $subjects,
        SubscribeHandler $handler,
    ): JsonResponse {
        $data = AdminSubscribeDTO::from($request->validated());

        $checkout = $handler->handle(new SubscribeCommand(
            subscriber: $subscribers->handle($data->subscriber_type, $data->subscriber_id),
            subject: $subjects->handle($data->subject_type, $data->subject_id),
            provider: $data->provider instanceof Optional ? null : $data->provider,
        ));

        return (new SubscriptionCheckoutResource($checkout))->toCreatedResponse($request);
    }

    #[OA\Get(
        path: '/api/admin/v1/projects/{project}/pay/subscriptions',
        operationId: 'pay_index_api_admin_v1_projects_project_pay_subscriptions',
        tags: ['pay'],
        summary: 'GET /api/admin/v1/projects/{project}/pay/subscriptions',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'cursor', in: 'query', required: false, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'subject_type', in: 'query', required: false, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'per_page', in: 'query', required: false, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')],
    )]
    public function index(ListSubscriptionsRequest $request, ListSubscriptionsQuery $query): JsonResponse
    {
        return (new SubscriptionCursorCollection($query->handle($request->filter())))->toResponse($request);
    }

    /** action ∈ cancel | resume | pause | delete */
    #[OA\Post(
        path: '/api/admin/v1/projects/{project}/pay/subscriptions/{subscription}/{action}',
        operationId: 'pay_change_api_admin_v1_projects_project_pay_subscriptions_subscription_action',
        tags: ['pay'],
        summary: 'POST /api/admin/v1/projects/{project}/pay/subscriptions/{subscription}/{action}',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'subscription', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'action', in: 'path', required: true, schema: new OA\Schema(type: 'string', enum: ['cancel', 'resume', 'pause', 'delete'])),
        ],
        responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')],
    )]
    public function change(Request $request, string $project, string $subscriptionId, string $action, ChangeSubscriptionHandler $handler): JsonResponse
    {
        // Скоуп проекта — глобальный (BelongsToProject); чужая подписка не
        // находится и даёт 404 тем же телом, что и прежний ручной конверт.
        $subscription = Subscription::query()->with('subject')->findOrFail($subscriptionId);

        // Множество значений ограничено `whereIn` на маршруте (И7), поэтому
        // сюда доходит только допустимое оператору действие.
        $updated = $handler->handle(new ChangeSubscriptionCommand($subscription, SubscriptionAction::from($action)));

        return (new SubscriptionResource(SubscriptionDTO::fromModel($updated)))->toResponse($request);
    }
}
