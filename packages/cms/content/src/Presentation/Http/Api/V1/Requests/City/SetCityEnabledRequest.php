<?php

declare(strict_types=1);

namespace Cms\Content\Presentation\Http\Api\V1\Requests\City;

use Illuminate\Foundation\Http\FormRequest;

/** Переключение включённости города в проекте. */
final class SetCityEnabledRequest extends FormRequest
{
    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return ['enabled' => ['required', 'boolean']];
    }
}
