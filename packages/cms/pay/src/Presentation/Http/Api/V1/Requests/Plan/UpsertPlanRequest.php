<?php

declare(strict_types=1);

namespace Cms\Pay\Presentation\Http\Api\V1\Requests\Plan;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Правила приёма тарифа. Перенесены из `UpsertPlanDTO::rules()` дословно —
 * состав, порядок и тексты сообщений 422 остаются прежними (снимки
 * admin-plans-store-422-required / -422-invalid, admin-plans-update-422).
 *
 * Ключи, которых нет в запросе, не попадают в `validated()` — DTO собирается
 * ровно из него, поэтому «ключ отсутствует» не превращается в null (И1).
 */
final class UpsertPlanRequest extends FormRequest
{
    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'max:64', 'alpha_dash'],
            'name' => ['required', 'string', 'max:255'],
            'price_minor' => ['required', 'integer', 'min:0'],
            'currency' => ['sometimes', 'string', 'size:3'],
            'interval' => ['sometimes', 'in:day,month,year'],
            'options' => ['sometimes', 'array'],
            'features' => ['sometimes', 'array'],
            'features.*' => ['string', 'max:64'],
        ];
    }
}
