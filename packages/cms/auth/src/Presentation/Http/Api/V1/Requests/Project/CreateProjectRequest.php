<?php

declare(strict_types=1);

namespace Cms\Auth\Presentation\Http\Api\V1\Requests\Project;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Создание проекта. Уникальность ключа — обращение к БД, ему место здесь, а не в DTO.
 * Ключ необязателен: без него платформа выводит его из названия сама.
 */
final class CreateProjectRequest extends FormRequest
{
    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return [
            'key' => ['sometimes', 'string', 'max:64', 'alpha_dash', 'unique:projects,key'],
            'name' => ['required', 'string', 'max:255'],
            'locales' => ['sometimes', 'array', 'min:1'],
            'locales.*' => ['string', 'max:10'],
        ];
    }
}
