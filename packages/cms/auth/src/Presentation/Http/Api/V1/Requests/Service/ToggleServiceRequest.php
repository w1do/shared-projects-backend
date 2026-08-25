<?php

declare(strict_types=1);

namespace Cms\Auth\Presentation\Http\Api\V1\Requests\Service;

use Illuminate\Foundation\Http\FormRequest;

/** Включение/выключение сервиса на проект. */
final class ToggleServiceRequest extends FormRequest
{
    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return ['enabled' => ['required', 'boolean']];
    }
}
