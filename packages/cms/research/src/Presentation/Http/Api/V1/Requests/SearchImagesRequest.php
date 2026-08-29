<?php

declare(strict_types=1);

namespace Cms\Research\Presentation\Http\Api\V1\Requests;

use Illuminate\Foundation\Http\FormRequest;

/** Подбор изображения: текстовый запрос обязателен, число результатов ограничено. */
final class SearchImagesRequest extends FormRequest
{
    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return [
            'query' => ['required', 'string', 'min:2', 'max:255'],
            'limit' => ['sometimes', 'integer', 'min:1', 'max:50'],
        ];
    }

    public function searchQuery(): string
    {
        return (string) $this->validated('query');
    }

    public function limit(): ?int
    {
        $limit = $this->validated('limit');

        return is_numeric($limit) ? (int) $limit : null;
    }
}
