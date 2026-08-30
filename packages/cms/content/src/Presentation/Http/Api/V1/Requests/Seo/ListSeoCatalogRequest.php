<?php

declare(strict_types=1);

namespace Cms\Content\Presentation\Http\Api\V1\Requests\Seo;

use Cms\Content\Application\DTOs\Seo\SeoCatalogFilterDTO;
use Cms\Content\Domain\Enums\SeoableType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/** Отбор каталога SEO: тип сущности, сортировка, размер страницы — всё необязательно. */
final class ListSeoCatalogRequest extends FormRequest
{
    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return [
            'type' => ['sometimes', 'string', Rule::enum(SeoableType::class)],
            'sort' => ['sometimes', 'string', Rule::in(['type', 'title', 'updated_at'])],
            'direction' => ['sometimes', 'string', Rule::in(['asc', 'desc'])],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ];
    }

    public function filter(): SeoCatalogFilterDTO
    {
        return SeoCatalogFilterDTO::from($this->validated());
    }
}
