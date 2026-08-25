<?php

declare(strict_types=1);

namespace Cms\Localization\Presentation\Http\Api\V1\Requests;

use Cms\Localization\Application\Queries\ProjectLocalesQuery;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

final class UpsertTranslationRequest extends FormRequest
{
    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return [
            'key' => ['required', 'string', 'max:255'],
            'values' => ['required', 'array', 'min:1'],
            'values.*' => ['string', 'max:10000'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        // Значения допускаются только для локалей проекта: опечатка в имени
        // локали не должна тихо оседать в данных.
        $validator->after(function (Validator $validator): void {
            $allowed = app(ProjectLocalesQuery::class)->handle($this);
            /** @var array<string, string> $values */
            $values = (array) $this->input('values', []);
            foreach (array_keys($values) as $locale) {
                if (! in_array((string) $locale, $allowed, true)) {
                    $validator->errors()->add("values.{$locale}", "Locale '{$locale}' is not declared for this project.");
                }
            }
        });
    }
}
