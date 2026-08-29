<?php

declare(strict_types=1);

namespace Cms\Content\Presentation\Http\Api\V1\Requests\Post;

use Cms\Content\Application\DTOs\Post\UpsertPostDTO;
use Illuminate\Foundation\Http\FormRequest;

/** Правила перенесены из `UpsertPostDTO::rules()` дословно (снимки `posts-store-422`, `posts-update-422`). */
final class UpsertPostRequest extends FormRequest
{
    /** @return array<string, list<string>> */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['sometimes', 'string', 'max:255', 'alpha_dash'],
            'body' => ['sometimes', 'nullable', 'string'],
            'locale' => ['sometimes', 'string', 'max:10'],
            'translation_group' => ['sometimes', 'nullable', 'string', 'max:64'],
            'categories' => ['sometimes', 'array'],
            'categories.*' => ['integer'],
            'is_index' => ['sometimes', 'boolean'],
            'tags' => ['sometimes', 'array'],
            'tags.*' => ['string', 'max:64'],
        ];
    }

    /**
     * Только `from(validated())` (И1): непереданные `categories` не должны
     * приводить к `sync([])` — привязки поста остаются на месте.
     */
    public function upsert(): UpsertPostDTO
    {
        return UpsertPostDTO::from($this->validated());
    }
}
