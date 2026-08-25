<?php

declare(strict_types=1);

namespace Cms\Pay\Presentation\Http\Api\V1\Resources\Payment;

use Cms\Pay\Application\DTOs\Payment\PaymentDTO;
use Cms\Pay\Domain\Models\Payment;
use Cms\Shared\Http\Resources\ApiResource;
use Illuminate\Http\Request;

/**
 * Элемент курсорной страницы платежей.
 *
 * Элементами самого пагинатора обязаны оставаться модели: курсор строится
 * из атрибутов последнего элемента (`created_at`, `id`), и подмена их на DTO
 * даёт курсор в другом формате даты и битую вторую страницу — поймано
 * снимком admin-payments-index-cursor-second. Поэтому модель превращается
 * в DTO здесь, на самой границе ответа, а не в query.
 *
 * @property Payment $resource
 */
final class PaymentCursorItemResource extends ApiResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return (new PaymentResource(PaymentDTO::fromModel($this->resource)))->toArray($request);
    }
}
