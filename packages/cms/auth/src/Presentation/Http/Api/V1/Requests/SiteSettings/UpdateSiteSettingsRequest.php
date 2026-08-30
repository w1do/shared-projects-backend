<?php

declare(strict_types=1);

namespace Cms\Auth\Presentation\Http\Api\V1\Requests\SiteSettings;

use Cms\Auth\Application\Queries\ProjectLocalesQuery;
use Cms\Auth\Domain\Enums\ProjectType;
use Cms\Auth\Domain\Settings\SiteSettings;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class UpdateSiteSettingsRequest extends FormRequest
{
    public function __construct(private readonly ProjectLocalesQuery $locales)
    {
        parent::__construct();
    }

    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return [
            'project_type' => ['required', 'string', Rule::in(ProjectType::values())],
            'timezone' => ['required', 'string', Rule::in(SiteSettings::timezones())],
            // Язык по умолчанию — только из локалей, привязанных к проекту
            'language' => ['required', 'string', Rule::in($this->locales->handle())],
            'currency_default' => ['required', 'string', 'size:3', 'in_array:currencies.*'],
            'currencies' => ['required', 'array', 'min:1'],
            'currencies.*' => ['string', Rule::in(SiteSettings::currencyCodes())],
        ];
    }
}
