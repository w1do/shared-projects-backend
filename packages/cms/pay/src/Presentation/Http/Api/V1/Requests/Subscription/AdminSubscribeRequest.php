<?php

declare(strict_types=1);

namespace Cms\Pay\Presentation\Http\Api\V1\Requests\Subscription;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Правила приёма admin-оформления подписки. Резолв подписчика и предмета —
 * доменные инварианты (Д16): проверяются queries по морф-алиасам,
 * а не правилами `exists`.
 */
final class AdminSubscribeRequest extends FormRequest
{
    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return [
            'subscriber_type' => ['required', 'string', 'max:32'],
            'subscriber_id' => ['required', 'string', 'max:64'],
            'subject_type' => ['required', 'string', 'max:32'],
            'subject_id' => ['required', 'string', 'max:64'],
            'provider' => ['sometimes', 'string', 'max:32'],
        ];
    }
}
