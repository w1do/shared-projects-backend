<?php

declare(strict_types=1);

namespace Cms\Content\Application\DTOs\Category;

use Spatie\LaravelData\Data;
use Spatie\LaravelData\Optional;

final class UpsertCategoryDTO extends Data
{
    /** @param string|array<string, string> $name строка — локаль по умолчанию, массив — набор по локалям */
    public function __construct(
        public string|array $name,
        public string|Optional $slug,
        public int|Optional|null $parent_id,
        public bool|Optional $is_index,
    ) {}

    /** @return array<string, list<mixed>> */
    public static function rules(): array
    {
        return [
            // Имя переводимо: строка (совместимость) или {locale: value}
            'name' => ['required'],
            'name.*' => ['sometimes', 'string', 'max:255'],
            'slug' => ['sometimes', 'string', 'max:255', 'alpha_dash'],
            'parent_id' => ['sometimes', 'nullable', 'integer'],
            'is_index' => ['sometimes', 'boolean'],
        ];
    }

    /** Значение локали по умолчанию — для генерации slug. */
    public function defaultName(string $defaultLocale = 'en'): string
    {
        if (is_string($this->name)) {
            return $this->name;
        }

        return (string) ($this->name[$defaultLocale] ?? (reset($this->name) ?: ''));
    }
}
