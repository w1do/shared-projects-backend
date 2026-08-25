<?php

declare(strict_types=1);

namespace Cms\Auth\Presentation\Http\Api\V1\Requests\ApiKey;

use Illuminate\Foundation\Http\FormRequest;

/** Выдача API-ключа проекта. */
final class IssueApiKeyRequest extends FormRequest
{
    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return [
            'type' => ['required', 'in:public,secret'],
            'scopes' => ['sometimes', 'array'],
            'scopes.*' => ['string', 'max:64'],
        ];
    }
}
