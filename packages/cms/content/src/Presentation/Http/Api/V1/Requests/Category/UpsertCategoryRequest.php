<?php

declare(strict_types=1);

namespace Cms\Content\Presentation\Http\Api\V1\Requests\Category;

use Cms\Content\Application\DTOs\Category\UpsertCategoryDTO;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Правила перенесены из `UpsertCategoryDTO::rules()` дословно, включая порядок:
 * он задаёт порядок ключей в `error.details` (снимки `categories-store-422`,
 * `categories-update-422`). Один и тот же набор действует на store и update —
 * `name` обязателен и при обновлении (снимок `categories-update-422`).
 */
final class UpsertCategoryRequest extends FormRequest
{
    /** @return array<string, list<string>> */
    public function rules(): array
    {
        return [
            // Имя переводимо: строка (совместимость) или {locale: value}
            'name' => ['required'],
            'name.*' => ['sometimes', 'string', 'max:255'],
            'slug' => ['sometimes', 'string', 'max:255', 'alpha_dash'],
            'parent_id' => ['sometimes', 'nullable', 'integer'],
            'is_index' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * DTO собирается ТОЛЬКО из `validated()` целиком (Safety Protocol, И1):
     * достройка недостающих ключей через `?? null` превратила бы «ключ
     * отсутствует» в «ключ = null» и увела бы узел в корень вместе с поддеревом.
     */
    public function upsert(): UpsertCategoryDTO
    {
        return UpsertCategoryDTO::from($this->validated());
    }
}
