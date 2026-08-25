<?php

declare(strict_types=1);

namespace Cms\Pay\Presentation\Http\Api\V1\Controllers\Site;

use Cms\Contracts\Introspection\IntrospectionResult;
use Cms\Contracts\Introspection\Subject;
use Cms\Pay\Application\Commands\ChangeSubscriptionCommand;
use Cms\Pay\Application\Commands\SubscribeCommand;
use Cms\Pay\Application\DTOs\Payment\PaymentDTO;
use Cms\Pay\Application\DTOs\Subscription\SubscribeDTO;
use Cms\Pay\Application\DTOs\Subscription\SubscriptionDTO;
use Cms\Pay\Application\Handlers\ChangeSubscriptionHandler;
use Cms\Pay\Application\Handlers\SubscribeHandler;
use Cms\Pay\Domain\Models\Subscription;
use Cms\Shared\AuthClient\CachedIntrospector;
use Cms\Shared\Http\ApiResponse;
use Cms\Shared\Http\ErrorEnvelope;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

/**
 * Подписки пользователя сайта: субъект берётся из introspection токена guard web
 * (X-User-Token) поверх API-ключа проекта.
 */
final class SiteSubscriptionController
{
    #[OA\Post(path: '/api/v1/pay/subscriptions', operationId: 'pay_subscribe_api_v1_pay_subscriptions', tags: ['pay'], summary: 'POST /api/v1/pay/subscriptions', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function subscribe(SubscribeDTO $data, Request $request, SubscribeHandler $handler): JsonResponse
    {
        $userKey = $this->userKey($request);
        if ($userKey === null) {
            return ErrorEnvelope::unauthorized('User token required.');
        }

        $result = $handler->handle(new SubscribeCommand($userKey, $data->plan_code));

        return ApiResponse::created([
            'subscription' => SubscriptionDTO::fromModel($result['subscription']),
            'payment' => PaymentDTO::fromModel($result['payment']),
        ]);
    }

    public function mine(Request $request): JsonResponse
    {
        $userKey = $this->userKey($request);
        if ($userKey === null) {
            return ErrorEnvelope::unauthorized('User token required.');
        }

        $subscriptions = Subscription::query()->with('plan')->where('user_key', $userKey)->get();

        return ApiResponse::data($subscriptions->map(fn (Subscription $s) => SubscriptionDTO::fromModel($s)));
    }

    #[OA\Post(path: '/api/v1/pay/subscriptions/{subscription}/{action}', operationId: 'pay_change_api_v1_pay_subscriptions_subscription_action', tags: ['pay'], summary: 'POST /api/v1/pay/subscriptions/{subscription}/{action}', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function change(Request $request, string $subscriptionId, string $action, ChangeSubscriptionHandler $handler): JsonResponse
    {
        $userKey = $this->userKey($request);
        if ($userKey === null) {
            return ErrorEnvelope::unauthorized('User token required.');
        }
        if (! in_array($action, ['cancel', 'resume', 'pause'], true)) {
            return ErrorEnvelope::validation(['action' => ['Unknown action.']]);
        }

        $subscription = Subscription::query()->with('plan')
            ->where('user_key', $userKey)->find($subscriptionId);
        if ($subscription === null) {
            return ErrorEnvelope::notFound();
        }

        return ApiResponse::data(SubscriptionDTO::fromModel(
            $handler->handle(new ChangeSubscriptionCommand($subscription, $action)),
        ));
    }

    /** user_key из токена пользователя сайта, проверенного через introspection. */
    private function userKey(Request $request): ?string
    {
        $token = $request->header('X-User-Token');
        if (! is_string($token) || $token === '') {
            return null;
        }

        /** @var IntrospectionResult $result */
        $result = app(CachedIntrospector::class)->token($token);
        $projectId = $request->attributes->get('introspection')?->projectId;

        if (! $result->active || $result->subject !== Subject::ProjectUser || $result->projectId !== $projectId) {
            return null;
        }

        return "user:{$result->projectId}:{$result->userId}";
    }
}
