<?php

declare(strict_types=1);

namespace Cms\Pay\Presentation\Http\Api\V1\Resources\Subscription;

use Cms\Pay\Application\DTOs\Subscription\SubscriptionDTO;
use Cms\Pay\Domain\Models\Subscription;
use Cms\Shared\Http\Resources\ApiResource;
use Illuminate\Http\Request;

/**
 * Элемент курсорной страницы подписок — по той же причине, что и у платежей:
 * курсор строится из атрибутов модели, поэтому пагинатор несёт модели,
 * а превращение в DTO происходит на границе ответа.
 *
 * @property Subscription $resource
 */
final class SubscriptionCursorItemResource extends ApiResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return (new SubscriptionResource(SubscriptionDTO::fromModel($this->resource)))->toArray($request);
    }
}
