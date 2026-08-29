<?php

declare(strict_types=1);

namespace Cms\Auth\Presentation\Http\Api\V1\Requests\Project;

use Illuminate\Foundation\Http\FormRequest;

/** Заполнение описания и тематики проекта сборкой по AI (межсервисный вызов). */
final class ProjectProfileRequest extends FormRequest
{
    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return [
            'project_id' => ['required', 'string', 'max:64'],
            'description' => ['sometimes', 'nullable', 'string', 'max:5000'],
            'topic' => ['sometimes', 'nullable', 'string', 'max:255'],
            'overwrite' => ['sometimes', 'boolean'],
        ];
    }
}
