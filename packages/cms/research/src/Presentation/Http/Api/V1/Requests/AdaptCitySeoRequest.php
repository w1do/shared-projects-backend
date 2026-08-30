<?php

declare(strict_types=1);

namespace Cms\Research\Presentation\Http\Api\V1\Requests;

use Illuminate\Foundation\Http\FormRequest;

/** Запуск адаптации SEO городов: тематика проекта переопределяется текстом. */
final class AdaptCitySeoRequest extends FormRequest
{
    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return ['topic' => ['sometimes', 'nullable', 'string', 'max:255']];
    }

    public function topic(): ?string
    {
        $topic = $this->validated('topic');

        return is_string($topic) ? $topic : null;
    }
}
