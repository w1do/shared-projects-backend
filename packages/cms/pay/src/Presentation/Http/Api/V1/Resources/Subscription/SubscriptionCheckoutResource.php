<?php

declare(strict_types=1);

namespace Cms\Pay\Presentation\Http\Api\V1\Resources\Subscription;

use Cms\Pay\Application\DTOs\Subscription\SubscriptionCheckoutDTO;
use Cms\Pay\Presentation\Http\Api\V1\Resources\Payment\PaymentResource;
use Cms\Shared\Http\Resources\ApiResource;
use Illuminate\Http\Request;

/**
 * Ответ оформления подписки: `{"data": {"subscription": ..., "payment": ...}}`.
 * Состав и порядок ключей — контракт (снимок public-subscribe).
 *
 * @property SubscriptionCheckoutDTO $resource
 */
final class SubscriptionCheckoutResource extends ApiResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'subscription' => (new SubscriptionResource($this->resource->subscription))->toArray($request),
            'payment' => (new PaymentResource($this->resource->payment))->toArray($request),
        ];
    }
}
