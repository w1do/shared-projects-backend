<?php

declare(strict_types=1);

namespace Cms\Licensing\Presentation\Http\Api\V1\Requests\Plan;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Правила приёма плана лицензионной поставки. Цена периода — вся тройка
 * или ничего: `required_with` держит инвариант на приёме, уникальность
 * `code` в проекте — доменный инвариант handler'а.
 */
final class UpsertPlanRequest extends FormRequest
{
    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'max:64', 'alpha_dash'],
            'name' => ['required', 'string', 'max:255'],
            // без `sometimes`: required_with обязан срабатывать и на отсутствующем ключе
            'price_minor' => ['nullable', 'integer', 'min:0', 'required_with:currency,interval'],
            'currency' => ['nullable', 'string', 'size:3', 'required_with:price_minor,interval'],
            'interval' => ['nullable', 'in:day,month,year', 'required_with:price_minor,currency'],
        ];
    }
}
