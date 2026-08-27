<?php

declare(strict_types=1);

namespace Cms\Analytics\Presentation\Http\Api\V1\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;

final class UpdateAnalyticsSettingsRequest extends FormRequest
{
    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return [
            'yandex_enabled' => ['required', 'boolean'],
            'yandex_id' => ['nullable', 'string', 'max:64', 'required_if:yandex_enabled,true'],
            'google_enabled' => ['required', 'boolean'],
            'google_id' => ['nullable', 'string', 'max:64', 'required_if:google_enabled,true'],
        ];
    }
}
