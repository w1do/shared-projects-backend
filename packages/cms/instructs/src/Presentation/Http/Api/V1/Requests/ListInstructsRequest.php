<?php

declare(strict_types=1);

namespace Cms\Instructs\Presentation\Http\Api\V1\Requests;

use Cms\Instructs\Domain\Enums\InstructCategory;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class ListInstructsRequest extends FormRequest
{
    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return [
            'category' => ['sometimes', 'string', Rule::in(InstructCategory::values())],
        ];
    }
}
