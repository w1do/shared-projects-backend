<?php

declare(strict_types=1);

namespace Cms\Pay\Presentation\Http\Api\V1\Requests\Subscription;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Правила приёма оформления подписки. Существование и доступность плана —
 * доменный инвариант и проверяется в handler'е (Decision 2), а не правилом
 * `exists`: тексты 422 обеих веток зафиксированы снимками.
 */
final class SubscribeRequest extends FormRequest
{
    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return ['plan_code' => ['required', 'string', 'max:64']];
    }
}
