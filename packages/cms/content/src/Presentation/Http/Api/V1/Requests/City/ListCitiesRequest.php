<?php

declare(strict_types=1);

namespace Cms\Content\Presentation\Http\Api\V1\Requests\City;

use Cms\Content\Application\DTOs\City\CityFilterDTO;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/** Отбор городов проекта: поиск, регион, включённость, сортировка — всё необязательно. */
final class ListCitiesRequest extends FormRequest
{
    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return [
            'search' => ['sometimes', 'string', 'max:255'],
            'region_id' => ['sometimes', 'integer', 'min:1'],
            'enabled' => ['sometimes', 'boolean'],
            'sort' => ['sometimes', 'string', Rule::in(['population', 'name'])],
            'direction' => ['sometimes', 'string', Rule::in(['asc', 'desc'])],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ];
    }

    public function filter(): CityFilterDTO
    {
        $validated = $this->validated();

        return CityFilterDTO::from([
            ...$validated,
            'enabled' => array_key_exists('enabled', $validated) ? $this->boolean('enabled') : null,
        ]);
    }
}
