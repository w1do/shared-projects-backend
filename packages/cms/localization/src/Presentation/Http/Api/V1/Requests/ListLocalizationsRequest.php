<?php

declare(strict_types=1);

namespace Cms\Localization\Presentation\Http\Api\V1\Requests;

use Illuminate\Foundation\Http\FormRequest;

final class ListLocalizationsRequest extends FormRequest
{
    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return [
            'service' => ['sometimes', 'string', 'max:32'],
            'locale' => ['sometimes', 'string', 'max:12'],
        ];
    }
}
