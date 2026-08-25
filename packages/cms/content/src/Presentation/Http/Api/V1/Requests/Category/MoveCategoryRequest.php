<?php

declare(strict_types=1);

namespace Cms\Content\Presentation\Http\Api\V1\Requests\Category;

use Cms\Content\Application\DTOs\Category\MoveCategoryDTO;
use Illuminate\Foundation\Http\FormRequest;

/** Правила перенесены из `MoveCategoryDTO::rules()` дословно (снимок `categories-move-422`). */
final class MoveCategoryRequest extends FormRequest
{
    /** @return array<string, list<string>> */
    public function rules(): array
    {
        return [
            'parent_id' => ['sometimes', 'nullable', 'integer'],
            'position' => ['sometimes', 'integer', 'min:0'],
        ];
    }

    /** Только `from(validated())`: отсутствие parent_id ≠ parent_id = null (И1). */
    public function move(): MoveCategoryDTO
    {
        return MoveCategoryDTO::from($this->validated());
    }
}
