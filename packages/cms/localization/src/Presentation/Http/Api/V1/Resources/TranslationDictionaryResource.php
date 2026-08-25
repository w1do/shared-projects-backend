<?php

declare(strict_types=1);

namespace Cms\Localization\Presentation\Http\Api\V1\Resources;

use Cms\Shared\Http\Resources\ApiResource;
use Illuminate\Http\Request;

/**
 * Плоский словарь панели: `{"data": {"ключ": "значение"}}`.
 * Пустой словарь отдаётся как `[]` — форма ответа не менялась с ApiResponse::data().
 *
 * @property array<string, string> $resource
 */
final class TranslationDictionaryResource extends ApiResource
{
    /** Ключи словаря произвольны (в том числе числоподобные) — не переиндексируем. */
    public bool $preserveKeys = true;

    /** @return array<string, string> */
    public function toArray(Request $request): array
    {
        return $this->resource;
    }
}
