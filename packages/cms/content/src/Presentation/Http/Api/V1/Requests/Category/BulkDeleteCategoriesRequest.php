<?php

declare(strict_types=1);

namespace Cms\Content\Presentation\Http\Api\V1\Requests\Category;

use Illuminate\Foundation\Http\FormRequest;

/** Массовое удаление категорий: непустой список целых идентификаторов. */
final class BulkDeleteCategoriesRequest extends FormRequest
{
    /** @return array<string, list<string>> */
    public function rules(): array
    {
        return [
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer'],
        ];
    }

    /** @return list<int> */
    public function ids(): array
    {
        $ids = $this->validated('ids');

        return array_values(array_map('intval', is_array($ids) ? $ids : []));
    }
}
