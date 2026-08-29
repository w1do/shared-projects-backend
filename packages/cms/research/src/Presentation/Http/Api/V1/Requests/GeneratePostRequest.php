<?php

declare(strict_types=1);

namespace Cms\Research\Presentation\Http\Api\V1\Requests;

use Illuminate\Foundation\Http\FormRequest;

final class GeneratePostRequest extends FormRequest
{
    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return [
            'topic_id' => ['required', 'integer', 'min:1'],
        ];
    }
}
