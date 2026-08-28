<?php

declare(strict_types=1);

namespace Cms\Licensing\Presentation\Http\Api\V1\Requests\License;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Правила приёма выпуска лицензии. Существование организации и плана
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
            'expires_at' => ['required', 'date', 'after:now'],
        ];
    }
}
