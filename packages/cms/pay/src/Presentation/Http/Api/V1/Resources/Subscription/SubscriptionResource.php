<?php

declare(strict_types=1);

namespace Cms\Pay\Presentation\Http\Api\V1\Resources\Subscription;

use Cms\Pay\Application\DTOs\Subscription\SubscriptionDTO;
use Cms\Pay\Presentation\Http\Api\V1\Resources\Plan\PlanResource;
use Cms\Shared\Http\Resources\ApiResource;
use Illuminate\Http\Request;

/**
 * Подписка в ответе. Вложенный `plan` присутствует всегда — при незагруженной
 * связи он равен null (прежнее поведение SubscriptionDTO::fromModel).
 *
 * @property SubscriptionDTO $resource
 */
final class SubscriptionResource extends ApiResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $plan = $this->resource->plan;

        return [
            'id' => $this->resource->id,
            'user_key' => $this->resource->user_key,
            'status' => $this->resource->status,
            'grants_access' => $this->resource->grants_access,
            'current_period_ends_at' => $this->resource->current_period_ends_at,
            'plan' => $plan === null ? null : (new PlanResource($plan))->toArray($request),
        ];
    }
}
