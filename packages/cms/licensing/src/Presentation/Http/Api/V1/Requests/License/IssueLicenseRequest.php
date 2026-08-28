<?php

declare(strict_types=1);

namespace Cms\Licensing\Presentation\Http\Api\V1\Requests\License;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Правила приёма выпуска лицензии (Д2). Существование организации и плана
 * в проекте — резолв queries (404 на чужие), не правила `exists`.
 */
final class IssueLicenseRequest extends FormRequest
{
    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return [
            'organization_id' => ['required', 'integer'],
            'plan_id' => ['required', 'integer'],
            'updates_until' => ['required', 'date', 'after:now'],
            'max_installations' => ['sometimes', 'integer', 'min:1', 'max:1000'],
            'entitled_version' => ['sometimes', 'nullable', 'string', 'regex:/^\d+\.\d+\.\d+$/'],
            'note' => ['sometimes', 'nullable', 'string', 'max:2000'],
        ];
    }
}
