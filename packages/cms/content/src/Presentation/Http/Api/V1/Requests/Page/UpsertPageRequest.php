<?php

declare(strict_types=1);

namespace Cms\Content\Presentation\Http\Api\V1\Requests\Page;

use Cms\Content\Application\DTOs\Page\UpsertPageDTO;
use Illuminate\Foundation\Http\FormRequest;

/** Правила перенесены из `UpsertPageDTO::rules()` дословно (снимки `pages-store-422`, `pages-update-422`). */
final class UpsertPageRequest extends FormRequest
{
    /** @return array<string, list<string>> */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['sometimes', 'string', 'max:255', 'alpha_dash'],
            'body' => ['sometimes', 'nullable', 'string'],
            'locale' => ['sometimes', 'string', 'max:10'],
            'is_index' => ['sometimes', 'boolean'],
        ];
    }

    /** Только `from(validated())`: непереданное поле остаётся Optional (И1). */
    public function upsert(): UpsertPageDTO
    {
        return UpsertPageDTO::from($this->validated());
    }
}
