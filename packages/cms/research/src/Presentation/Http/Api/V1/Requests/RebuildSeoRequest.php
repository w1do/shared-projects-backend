<?php

declare(strict_types=1);

namespace Cms\Research\Presentation\Http\Api\V1\Requests;

use Cms\Content\Domain\Enums\SeoableType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/** Запуск пересборки SEO: перечисленные сущности или, без списка, весь проект. */
final class RebuildSeoRequest extends FormRequest
{
    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return [
            'entities' => ['sometimes', 'array', 'max:500'],
            'entities.*.type' => ['required', 'string', Rule::in(SeoableType::catalogValues())],
            'entities.*.id' => ['required', 'integer', 'min:1'],
        ];
    }

    /** @return list<array{type: string, id: int}> */
    public function entities(): array
    {
        return array_map(
            static fn (array $entity): array => ['type' => (string) $entity['type'], 'id' => (int) $entity['id']],
            array_values($this->validated('entities', [])),
        );
    }
}
