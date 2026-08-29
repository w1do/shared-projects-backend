<?php

declare(strict_types=1);

namespace Cms\Research\Presentation\Http\Api\V1\Requests;

use Cms\Research\Domain\Enums\ResearchStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class ListResearchesRequest extends FormRequest
{
    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return [
            'status' => ['sometimes', 'string', Rule::enum(ResearchStatus::class)],
        ];
    }
}
