<?php

declare(strict_types=1);

namespace Cms\Auth\Presentation\Http\Api\V1\Requests\Translation;

use Illuminate\Foundation\Http\FormRequest;

/** Уведомление о новой версии словаря переводов проекта. */
final class TranslationsVersionRequest extends FormRequest
{
    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return [
            'project_id' => ['required', 'string'],
            'version' => ['required', 'integer', 'min:1'],
        ];
    }
}
