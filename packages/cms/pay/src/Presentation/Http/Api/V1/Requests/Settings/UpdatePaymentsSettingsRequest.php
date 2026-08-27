<?php

declare(strict_types=1);

namespace Cms\Pay\Presentation\Http\Api\V1\Requests\Settings;

use Cms\Pay\Infrastructure\Gateways\ProviderRegistry;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class UpdatePaymentsSettingsRequest extends FormRequest
{
    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        // platega — выбираемый провайдер раздела «Платежи»; шлюзы из
        // ProviderRegistry остаются доступными для обратной совместимости.
        return [
            'provider' => ['required', 'string', Rule::in(array_values(array_unique([
                'platega',
                ...ProviderRegistry::available(),
            ])))],
        ];
    }
}
