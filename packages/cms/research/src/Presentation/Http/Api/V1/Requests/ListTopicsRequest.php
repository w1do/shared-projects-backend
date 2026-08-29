<?php

declare(strict_types=1);

namespace Cms\Research\Presentation\Http\Api\V1\Requests;

use Cms\Research\Domain\Enums\TopicStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class ListTopicsRequest extends FormRequest
{
    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return [
            'status' => ['sometimes', 'string', Rule::enum(TopicStatus::class)],
        ];
    }
}
