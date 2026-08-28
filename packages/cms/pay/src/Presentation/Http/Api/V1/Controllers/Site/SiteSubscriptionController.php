<?php

declare(strict_types=1);

namespace Cms\Pay\Presentation\Http\Api\V1\Controllers\Site;

use Cms\Pay\Application\Commands\ChangeSubscriptionCommand;
use Cms\Pay\Application\Commands\SubscribeCommand;
use Cms\Pay\Application\DTOs\Subscription\SubscribeDTO;
use Cms\Pay\Application\DTOs\Subscription\SubscriptionDTO;
use Cms\Pay\Application\Handlers\ChangeSubscriptionHandler;
use Cms\Pay\Application\Handlers\SubscribeHandler;
use Cms\Pay\Application\Queries\FindSitePlanQuery;
use Cms\Pay\Application\Queries\FindSiteSubscriptionQuery;
use Cms\Pay\Application\Queries\ListSiteSubscriptionsQuery;
use Cms\Pay\Domain\Enums\SubscriptionAction;
use Cms\Pay\Presentation\Http\Api\V1\Requests\Subscription\SubscribeRequest;
use Cms\Pay\Presentation\Http\Api\V1\Resources\Subscription\SubscriptionCheckoutResource;
use Cms\Pay\Presentation\Http\Api\V1\Resources\Subscription\SubscriptionResource;
use Cms\Shared\AuthClient\RequestIntrospection;
use Cms\Shared\Billing\Subscriber;
use Cms\Shared\Http\ErrorEnvelope;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

/**
 * Подписки пользователя сайта: субъект берётся из introspection токена guard web
 * (X-User-Token) поверх API-ключа проекта. Публичный контракт (`plan_code`) не
 * меняется — код резолвится в предмет `plan` на этой границе.
 */
final class SiteSubscriptionController
{
    public function __construct(private readonly RequestIntrospection $introspection) {}

    #[OA\Post(
        path: '/api/v1/pay/subscriptions',
        operationId: 'pay_subscribe_api_v1_pay_subscriptions',
        tags: ['pay'],
        summary: 'POST /api/v1/pay/subscriptions',
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(
            required: ['plan_code'],
            properties: [
                new OA\Property(property: 'plan_code', type: 'string', maxLength: 64),
            ],
        )),
        responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')],
    )]
    public function subscribe(SubscribeRequest $request, FindSitePlanQuery $plans, SubscribeHandler $handler): JsonResponse
    {
        $subscriber = $this->subscriber($request);
        if ($subscriber === null) {
            return ErrorEnvelope::unauthorized('User token required.');
        }

        $data = SubscribeDTO::from($request->validated());
        $checkout = $handler->handle(new SubscribeCommand($subscriber, $plans->handle($data->plan_code)));

        return (new SubscriptionCheckoutResource($checkout))->toCreatedResponse($request);
    }

    #[OA\Get(path: '/api/v1/pay/subscriptions', operationId: 'pay_mine_api_v1_pay_subscriptions', tags: ['pay'], summary: 'GET /api/v1/pay/subscriptions', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated')])]
    public function mine(Request $request, ListSiteSubscriptionsQuery $query): JsonResponse
    {
        $subscriber = $this->subscriber($request);
        if ($subscriber === null) {
            return ErrorEnvelope::unauthorized('User token required.');
        }

        // Непагинированная коллекция без `meta` — форма списка не меняется (И5).
        return SubscriptionResource::collection($query->handle($subscriber))->toResponse($request);
    }

    #[OA\Post(path: '/api/v1/pay/subscriptions/{subscription}/{action}', operationId: 'pay_change_api_v1_pay_subscriptions_subscription_action', tags: ['pay'], summary: 'POST /api/v1/pay/subscriptions/{subscription}/{action}', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function change(
        Request $request,
        string $subscriptionId,
        string $action,
        FindSiteSubscriptionQuery $subscriptions,
        ChangeSubscriptionHandler $handler,
    ): JsonResponse {
        $subscriber = $this->subscriber($request);
        if ($subscriber === null) {
            return ErrorEnvelope::unauthorized('User token required.');
        }

        // Публичный маршрут намеренно БЕЗ `whereIn`: неизвестное действие здесь
        // обязано давать 422 `Unknown action.`, а не 404 (И2, снимок
        // public-subscription-422-action). Множество — только site-набор.
        $siteAction = SubscriptionAction::forSite($action);
        if ($siteAction === null) {
            return ErrorEnvelope::validation(['action' => ['Unknown action.']]);
        }

        $subscription = $subscriptions->handle($subscriber, $subscriptionId);
        $updated = $handler->handle(new ChangeSubscriptionCommand($subscription, $siteAction));

        return (new SubscriptionResource(SubscriptionDTO::fromModel($updated)))->toResponse($request);
    }

    /** Подписчик из токена пользователя сайта, проверенного интроспекцией. */
    private function subscriber(Request $request): ?Subscriber
    {
        return $this->introspection->siteSubscriber($request);
    }
}
