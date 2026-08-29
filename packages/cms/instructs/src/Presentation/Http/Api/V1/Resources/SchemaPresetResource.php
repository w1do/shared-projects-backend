<?php

declare(strict_types=1);

namespace Cms\Instructs\Presentation\Http\Api\V1\Resources;

use Cms\Instructs\Domain\Enums\InstructCategory;
use Cms\Shared\Http\Resources\ApiResource;
use Illuminate\Http\Request;

/** @property array<string, mixed> $resource */
final class SchemaPresetResource extends ApiResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $categories = $this->resource['categories'] ?? [];

        return [
            'key' => (string) ($this->resource['key'] ?? ''),
            'title' => (string) ($this->resource['title'] ?? ''),
            'entity' => (string) ($this->resource['entity'] ?? ''),
            'categories' => array_values(array_map(
                static fn (InstructCategory $category): string => $category->value,
                is_array($categories) ? $categories : [],
            )),
            'fields' => $this->resource['fields'] ?? [],
        ];
    }
}
