<?php

declare(strict_types=1);

namespace Cms\Content\Presentation\Http\Api\V1\Requests\Post;

use Cms\Content\Application\DTOs\Post\PublicPostsFilterDTO;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Разбор фильтров публичного списка постов.
 *
 * Правил валидации нет намеренно: маршрут не валидировал `locale`/`category`
 * никогда, а добавление правил сузило бы множество принимаемых запросов
 * (Safety Protocol, И2). Задача FormRequest здесь — снять разбор query-строки
 * с контроллера.
 */
final class PublicPostsRequest extends FormRequest
{
    /** @return array<string, list<string>> */
    public function rules(): array
    {
        return [];
    }

    public function filter(): PublicPostsFilterDTO
    {
        $category = $this->query('category');

        return new PublicPostsFilterDTO(
            locale: $this->query('locale'),
            categoryId: $category !== null ? (int) $category : null,
            // only() возвращает только присутствующие ключи — ключ запроса без
            // `tag` остаётся прежним, поэтому кэш переживает деплой (И12)
            cacheKeyParts: $this->only(['locale', 'category', 'cursor', 'tag']),
            tag: $this->query('tag'),
        );
    }
}
