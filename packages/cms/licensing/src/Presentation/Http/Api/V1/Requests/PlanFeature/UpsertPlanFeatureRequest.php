<?php

declare(strict_types=1);

namespace Cms\Licensing\Presentation\Http\Api\V1\Requests\PlanFeature;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Правила приёма фичи плана. Существование организации в проекте и
 * уникальность plan+organization+code — доменные инварианты handler'а.
 */
final class UpsertPlanFeatureRequest extends FormRequest
{
    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'max:64', 'alpha_dash'],
            'name' => ['required', 'string', 'max:255'],
            'organization_id' => ['sometimes', 'nullable', 'integer'],
        ];
    }
}
