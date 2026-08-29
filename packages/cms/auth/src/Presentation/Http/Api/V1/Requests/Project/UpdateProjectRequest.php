<?php

declare(strict_types=1);

namespace Cms\Auth\Presentation\Http\Api\V1\Requests\Project;

use Illuminate\Foundation\Http\FormRequest;

/** Частичное обновление проекта: непереданные поля остаются прежними. */
final class UpdateProjectRequest extends FormRequest
{
    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string', 'max:5000'],
            'topic' => ['sometimes', 'nullable', 'string', 'max:255'],
            'locales' => ['sometimes', 'array', 'min:1'],
            'locales.*' => ['string', 'max:10'],
        ];
    }
}
