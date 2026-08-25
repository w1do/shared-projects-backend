<?php

declare(strict_types=1);

namespace Cms\Pay\Presentation\Http\Api\V1\Resources\Payment;

use Cms\Pay\Application\DTOs\Payment\PaymentDTO;
use Cms\Shared\Http\Resources\ApiResource;
use Illuminate\Http\Request;

/**
 * Платёж в ответе. `amount_minor`/`refunded_minor` — целые минорные
 * единицы (И4, guard 0.6: строковые значения не проходят).
 *
 * @property PaymentDTO $resource
 */
final class PaymentResource extends ApiResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'user_key' => $this->resource->user_key,
            'amount_minor' => $this->resource->amount_minor,
            'refunded_minor' => $this->resource->refunded_minor,
            'currency' => $this->resource->currency,
            'status' => $this->resource->status,
            'provider' => $this->resource->provider,
            'description' => $this->resource->description,
            'subscription_id' => $this->resource->subscription_id,
            'created_at' => $this->resource->created_at,
        ];
    }
}
