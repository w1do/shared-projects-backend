<?php

declare(strict_types=1);

namespace Cms\Instructs\Presentation\Http\Api\V1\Requests;

use Cms\Instructs\Domain\Enums\InstructCategory;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class UpsertInstructRequest extends FormRequest
{
    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:120'],
            'category' => ['required', 'string', Rule::in(InstructCategory::values())],
            'rule' => ['required', 'string', 'max:20000'],
            'schema' => ['required', 'array'],
            'published' => ['sometimes', 'boolean'],
        ];
    }
}
