<?php

declare(strict_types=1);

namespace Cms\Research\Presentation\Http\Api\V1\Requests;

use Cms\Research\Domain\Enums\SearchEngine;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class StartResearchRequest extends FormRequest
{
    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return [
            'query' => ['required', 'string', 'min:3', 'max:255'],
            'offer' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'engine' => ['sometimes', 'nullable', 'string', Rule::in(SearchEngine::webSearchValues())],
            'sub_queries_count' => ['sometimes', 'nullable', 'integer', 'min:1', 'max:10'],
            'results_per_sub_query' => ['sometimes', 'nullable', 'integer', 'min:1', 'max:10'],
        ];
    }
}
