<?php

declare(strict_types=1);

namespace Cms\Pay\Presentation\Http\Api\V1\Requests\Payment;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Правила приёма возврата. `sometimes` критично: пустое тело означает
 * ПОЛНЫЙ возврат, а не нулевой — ключ обязан отсутствовать в `validated()`,
 * чтобы DTO получил `Optional`, а не null (И1, guard 0.4(e)).
 */
final class RefundPaymentRequest extends FormRequest
{
    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return ['amount_minor' => ['sometimes', 'integer', 'min:1']];
    }
}
