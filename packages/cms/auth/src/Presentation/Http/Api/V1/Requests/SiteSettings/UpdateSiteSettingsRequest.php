<?php

declare(strict_types=1);

namespace Cms\Auth\Presentation\Http\Api\V1\Requests\SiteSettings;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class UpdateSiteSettingsRequest extends FormRequest
{
    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return [
            // формат Cms\Shared\Values\Locale
            'language' => ['required', 'string', 'regex:/^[a-z]{2}(-[A-Z]{2})?$/'],
            'currency_default' => ['required', 'string', 'size:3', 'in_array:currencies.*'],
            'currencies' => ['required', 'array', 'min:1'],
            'currencies.*' => ['string', Rule::in(['RUB', 'USD'])],
        ];
    }
}
