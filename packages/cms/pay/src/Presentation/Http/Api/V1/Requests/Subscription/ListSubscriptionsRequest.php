<?php

declare(strict_types=1);

namespace Cms\Pay\Presentation\Http\Api\V1\Requests\Subscription;

use Cms\Pay\Application\DTOs\Subscription\SubscriptionFilterDTO;
use Illuminate\Foundation\Http\FormRequest;

/** Отбор подписок оператором: тип предмета и размер страницы, всё необязательно. */
final class ListSubscriptionsRequest extends FormRequest
{
    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return [
            'subject_type' => ['sometimes', 'string', 'max:32'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ];
    }

    public function filter(): SubscriptionFilterDTO
    {
        return SubscriptionFilterDTO::from($this->validated());
    }
}
