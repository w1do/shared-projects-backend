<?php

declare(strict_types=1);

namespace Cms\Content\Presentation\Http\Api\V1\Requests\Seo;

use Cms\Content\Application\DTOs\Seo\UpsertSeoDTO;
use Illuminate\Foundation\Http\FormRequest;

/** Правила перенесены из `SeoDTO::rules()` дословно (снимок `seo-update-422`). */
final class UpsertSeoRequest extends FormRequest
{
    /** @return array<string, list<string>> */
    public function rules(): array
    {
        return [
            'title' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:500'],
            'keywords' => ['nullable', 'string', 'max:500'],
            'canonical' => ['nullable', 'url', 'max:255'],
            'robots' => ['nullable', 'string', 'max:64'],
            'og_title' => ['nullable', 'string', 'max:255'],
            'og_description' => ['nullable', 'string', 'max:500'],
            'og_image' => ['nullable', 'string', 'max:255'],
            'twitter_card' => ['nullable', 'string', 'max:32'],
            'json_ld' => ['nullable', 'array'], // синтаксис JSON гарантирован типом
        ];
    }

    /**
     * Непереданное поле обнуляет запись — так было всегда (снимок `seo-update-empty`):
     * у входного DTO все свойства по умолчанию `null`, Optional здесь нет.
     */
    public function upsert(): UpsertSeoDTO
    {
        return UpsertSeoDTO::from($this->validated());
    }
}
