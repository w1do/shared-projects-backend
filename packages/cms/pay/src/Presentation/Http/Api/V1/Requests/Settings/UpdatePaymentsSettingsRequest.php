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
        // Допустимые значения — только реально зарегистрированные шлюзы:
        // никакого хардкода вне реестра (спека payments/provider-config).
        return [
            'provider' => ['required', 'string', Rule::in(ProviderRegistry::available())],
        ];
    }
}
