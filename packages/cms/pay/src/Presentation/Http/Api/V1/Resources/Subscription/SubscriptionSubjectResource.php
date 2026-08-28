<?php

declare(strict_types=1);

namespace Cms\Pay\Presentation\Http\Api\V1\Resources\Subscription;

use Cms\Pay\Application\DTOs\Subscription\SubscriptionSubjectDTO;
use Cms\Shared\Http\Resources\ApiResource;
use Illuminate\Http\Request;
use Spatie\LaravelData\Optional;

/**
 * Предмет подписки в ответе: общий минимум `{type, id, code, name}`;
 * тарифный план pay дополняется полной формой (цена, опции, фичи) —
 * Optional-поля других предметов в ответ не попадают.
 *
 * @property SubscriptionSubjectDTO $resource
 */
final class SubscriptionSubjectResource extends ApiResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $data = [
            'type' => $this->resource->type,
            'id' => $this->resource->id,
            'code' => $this->resource->code,
            'name' => $this->resource->name,
        ];

        foreach (['price_minor', 'currency', 'interval', 'archived', 'options', 'features'] as $field) {
            if (! $this->resource->{$field} instanceof Optional) {
                $data[$field] = $this->resource->{$field};
            }
        }

        return $data;
    }
}
