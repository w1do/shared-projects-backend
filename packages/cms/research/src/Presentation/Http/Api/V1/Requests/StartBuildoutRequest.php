<?php

declare(strict_types=1);

namespace Cms\Research\Presentation\Http\Api\V1\Requests;

use Illuminate\Foundation\Http\FormRequest;

final class StartBuildoutRequest extends FormRequest
{
    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return [
            'topic' => ['required', 'string', 'min:2', 'max:255'],
            'overwrite' => ['sometimes', 'boolean'],
        ];
    }
}
