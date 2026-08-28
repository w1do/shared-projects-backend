<?php

declare(strict_types=1);

namespace Cms\Licensing\Presentation\Http\Api\V1\Requests\Release;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Правила приёма релиза: строгий SemVer и трейн — сравнение версий идёт
 * только по валидированным значениям (риски Д5); уникальность версии
 * в проекте — доменный инвариант handler'а.
 */
final class UpsertReleaseRequest extends FormRequest
{
    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return [
            'version' => ['required', 'string', 'max:20', 'regex:/^\d+\.\d+\.\d+$/'],
            'train' => ['required', 'string', 'max:10', 'regex:/^\d+\.\d+$/'],
            'repository' => ['required', 'string', 'max:255'],
            'released_at' => ['required', 'date'],
            'is_security' => ['sometimes', 'boolean'],
            'min_upgrade_from' => ['sometimes', 'nullable', 'string', 'regex:/^\d+\.\d+\.\d+$/'],
            'changelog_url' => ['sometimes', 'nullable', 'url', 'max:255'],
        ];
    }
}
