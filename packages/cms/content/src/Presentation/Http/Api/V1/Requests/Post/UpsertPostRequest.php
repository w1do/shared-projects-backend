<?php

declare(strict_types=1);

namespace Cms\Content\Presentation\Http\Api\V1\Requests\Post;

use Cms\Content\Application\DTOs\Post\UpsertPostDTO;
use Cms\Content\Application\Queries\ProjectMediaExistsQuery;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

/** Правила перенесены из `UpsertPostDTO::rules()` дословно (снимки `posts-store-422`, `posts-update-422`). */
final class UpsertPostRequest extends FormRequest
{
    public function __construct(private readonly ProjectMediaExistsQuery $media)
    {
        parent::__construct();
    }

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
            'cover_media_id' => ['sometimes', 'nullable', 'integer'],
            'banner_media_id' => ['sometimes', 'nullable', 'integer'],
        ];
    }

    /** Изображение поста — только медиа текущего проекта: чужое и несуществующее отклоняются. */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            foreach (['cover_media_id', 'banner_media_id'] as $field) {
                $value = $this->input($field);

                if (! $this->has($field) || $value === null || $validator->errors()->has($field)) {
                    continue;
                }

                if (! $this->media->handle((int) $value)) {
                    $validator->errors()->add($field, 'The selected media file does not belong to this project.');
                }
            }
        });
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
