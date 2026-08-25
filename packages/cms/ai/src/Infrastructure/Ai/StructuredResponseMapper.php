<?php

declare(strict_types=1);

namespace Cms\Ai\Infrastructure\Ai;

use Cms\Ai\Application\DTOs\SuggestCategories\CategorySuggestionDTO;
use Cms\Ai\Application\Exceptions\AiResponseException;

/**
 * Маппинг структурного ответа модели в DTO пакета.
 *
 * Ответ, не прошедший маппинг, — AiResponseException: потребитель никогда не
 * получает сырой текст модели.
 */
final class StructuredResponseMapper
{
    /** @param array<string, mixed> $structured */
    public function stringField(array $structured, string $field): string
    {
        if (! isset($structured[$field]) || ! is_string($structured[$field])) {
            throw new AiResponseException("AI response is missing the '{$field}' field.");
        }

        return $structured[$field];
    }

    /**
     * @param  array<string, mixed>  $structured
     * @return list<mixed>
     */
    public function listField(array $structured, string $field): array
    {
        if (! isset($structured[$field]) || ! is_array($structured[$field])) {
            throw new AiResponseException("AI response is missing the '{$field}' list.");
        }

        return array_values($structured[$field]);
    }

    /**
     * Плоский список {key, locale, value} → ключ → [локаль => перевод] с
     * проверкой полноты: каждая строка переведена на каждую запрошенную локаль.
     *
     * @param  array<string, mixed>  $structured
     * @param  array<string, string>  $texts
     * @param  list<string>  $targetLocales
     * @return array<string, array<string, string>>
     */
    public function translations(array $structured, array $texts, array $targetLocales): array
    {
        $translations = [];
        foreach ($this->listField($structured, 'items') as $item) {
            if (! is_array($item) || ! isset($item['key'], $item['locale'], $item['value'])) {
                throw new AiResponseException('AI translation item is malformed.');
            }
            $translations[(string) $item['key']][(string) $item['locale']] = (string) $item['value'];
        }

        foreach (array_keys($texts) as $key) {
            foreach ($targetLocales as $locale) {
                if (! isset($translations[$key][$locale])) {
                    throw new AiResponseException("AI translation is missing locale '{$locale}' for key '{$key}'.");
                }
            }
        }

        return $translations;
    }

    /**
     * Плоский список {name, slug, parent_slug} → дерево DTO.
     *
     * @param  list<mixed>  $rows
     * @return list<CategorySuggestionDTO>
     */
    public function categoryTree(array $rows): array
    {
        $children = [];
        $order = [];

        foreach ($rows as $row) {
            if (! is_array($row) || ! isset($row['name'], $row['slug'])) {
                throw new AiResponseException('AI category suggestion is malformed.');
            }
            $parent = isset($row['parent_slug']) && is_string($row['parent_slug']) && $row['parent_slug'] !== ''
                ? $row['parent_slug']
                : null;
            $children[$parent ?? ''][] = ['name' => (string) $row['name'], 'slug' => (string) $row['slug']];
            $order[(string) $row['slug']] = true;
        }

        $build = function (?string $parentSlug) use (&$build, $children): array {
            $nodes = [];
            foreach ($children[$parentSlug ?? ''] ?? [] as $row) {
                $nodes[] = new CategorySuggestionDTO(
                    name: $row['name'],
                    slug: $row['slug'],
                    children: $build($row['slug']),
                );
            }

            return $nodes;
        };

        unset($order);

        return $build(null);
    }
}
