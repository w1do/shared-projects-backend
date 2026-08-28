<?php

declare(strict_types=1);

namespace Cms\Pay\Presentation\Http\Api\V1\Resources\Subscription;

use Cms\Pay\Application\DTOs\Subscription\SubscriptionDTO;
use Cms\Shared\Http\Resources\ApiResource;
use Illuminate\Http\Request;

/**
 * Подписка в ответе: подписчик — объект `subscriber {type, id}`, предмет —
 * полиморфный `subject`. Вложенный `subject` присутствует всегда — при
 * незагруженной связи он равен null (прежнее поведение поля `plan`).
 *
 * @property SubscriptionDTO $resource
 */
final class SubscriptionResource extends ApiResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $subject = $this->resource->subject;

        return [
            'id' => $this->resource->id,
            'subscriber' => [
                'type' => $this->resource->subscriber->type,
                'id' => $this->resource->subscriber->id,
            ],
            'status' => $this->resource->status,
            'grants_access' => $this->resource->grants_access,
            'current_period_ends_at' => $this->resource->current_period_ends_at,
            'subject' => $subject === null ? null : (new SubscriptionSubjectResource($subject))->toArray($request),
        ];
    }
}
