<?php

declare(strict_types=1);

namespace Cms\Pay\Presentation\Http\Api\V1\Requests\Payment;

use Cms\Pay\Application\DTOs\Payment\PaymentFilterDTO;
use Cms\Pay\Domain\Enums\PaymentStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/** Отбор платежей оператором: статус и размер страницы, всё необязательно. */
final class ListPaymentsRequest extends FormRequest
{
    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return [
            'status' => ['sometimes', 'string', Rule::enum(PaymentStatus::class)],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ];
    }

    public function filter(): PaymentFilterDTO
    {
        return PaymentFilterDTO::from($this->validated());
    }
}
