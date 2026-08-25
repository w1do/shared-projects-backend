<?php

declare(strict_types=1);

namespace Cms\Auth\Presentation\Http\Api\V1\Requests\Introspection;

use Illuminate\Foundation\Http\FormRequest;

/** Интроспекция: ровно один из источников субъекта обязателен. */
final class IntrospectRequest extends FormRequest
{
    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return [
            'token' => ['required_without:api_key', 'string'],
            'api_key' => ['required_without:token', 'string'],
            'project' => ['sometimes', 'string'],
        ];
    }
}
