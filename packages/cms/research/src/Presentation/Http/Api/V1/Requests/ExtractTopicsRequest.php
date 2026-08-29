<?php

declare(strict_types=1);

namespace Cms\Research\Presentation\Http\Api\V1\Requests;

use Illuminate\Foundation\Http\FormRequest;

final class ExtractTopicsRequest extends FormRequest
{
    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return [
            'max_count' => ['sometimes', 'nullable', 'integer', 'min:1', 'max:30'],
        ];
    }
}
