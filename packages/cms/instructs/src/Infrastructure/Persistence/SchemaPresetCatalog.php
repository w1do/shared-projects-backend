<?php

declare(strict_types=1);

namespace Cms\Instructs\Infrastructure\Persistence;

use Cms\Instructs\Domain\Enums\InstructCategory;

/**
 * Пресеты схем ответа по сущностям платформы: оператор берёт готовый набор
 * полей вместо набора JSON Schema с нуля. Состав полей повторяет то, что
 * платформа реально разбирает из ответа модели, — расхождение ловит
 * тест соответствия, а не прод.
 */
final class SchemaPresetCatalog
{
    /**
     * @return list<array{
     *     key: string,
     *     title: string,
     *     entity: string,
     *     categories: list<InstructCategory>,
     *     fields: list<array<string, mixed>>
     * }>
     */
    public static function all(): array
    {
        return [
            [
                'key' => 'categories',
                'title' => 'Дерево категорий проекта',
                'entity' => 'category',
                'categories' => [InstructCategory::CategoryTree, InstructCategory::ProjectDescription],
                'fields' => [
                    [
                        'name' => 'categories',
                        'type' => 'array',
                        'required' => true,
                        'description' => 'Плоский список категорий; вложенность задаётся через parent_slug',
                        'item' => [
                            'type' => 'object',
                            'fields' => [
                                ['name' => 'name', 'type' => 'string', 'required' => true, 'description' => 'Название категории на языке проекта'],
                                ['name' => 'slug', 'type' => 'string', 'required' => true, 'description' => 'Латинский slug в kebab-case, уникальный в проекте'],
                                ['name' => 'parent_slug', 'type' => 'string', 'required' => false, 'description' => 'Slug родителя; null у корневой категории'],
                            ],
                        ],
                    ],
                ],
            ],
            [
                'key' => 'post',
                'title' => 'Пост',
                'entity' => 'post',
                'categories' => [InstructCategory::PostBody],
                'fields' => [
                    ['name' => 'title', 'type' => 'string', 'required' => true, 'description' => 'Заголовок поста'],
                    ['name' => 'slug', 'type' => 'string', 'required' => true, 'description' => 'Латинский slug в kebab-case'],
                    [
                        'name' => 'blocks',
                        'type' => 'array',
                        'required' => true,
                        'description' => 'Части поста: название и текст в markdown, не меньше 10 штук',
                        'item' => [
                            'type' => 'object',
                            'fields' => [
                                ['name' => 'title', 'type' => 'string', 'required' => true, 'description' => 'Название части'],
                                ['name' => 'markdown', 'type' => 'string', 'required' => true, 'description' => 'Текст части в markdown'],
                            ],
                        ],
                    ],
                    [
                        'name' => 'tags',
                        'type' => 'array',
                        'required' => false,
                        'description' => 'Теги поста, 3–7 штук',
                        'item' => ['type' => 'string'],
                    ],
                ],
            ],
            [
                'key' => 'seo',
                'title' => 'SEO-поля материала',
                'entity' => 'seo',
                'categories' => [InstructCategory::PostSeo, InstructCategory::CitySeo],
                'fields' => [
                    ['name' => 'title', 'type' => 'string', 'required' => true, 'description' => 'SEO-заголовок, до 60 символов'],
                    ['name' => 'description', 'type' => 'string', 'required' => true, 'description' => 'SEO-описание, до 160 символов'],
                    ['name' => 'keywords', 'type' => 'string', 'required' => true, 'description' => 'Ключевые слова через запятую'],
                    ['name' => 'canonical', 'type' => 'string', 'required' => false, 'description' => 'Канонический адрес материала'],
                    ['name' => 'robots', 'type' => 'string', 'required' => false, 'description' => 'Директива robots, например index,follow'],
                    ['name' => 'og_title', 'type' => 'string', 'required' => false, 'description' => 'Заголовок для соцсетей (og:title)'],
                    ['name' => 'og_description', 'type' => 'string', 'required' => false, 'description' => 'Описание для соцсетей (og:description)'],
                    ['name' => 'og_image', 'type' => 'string', 'required' => false, 'description' => 'Адрес изображения для соцсетей (og:image)'],
                    ['name' => 'twitter_card', 'type' => 'string', 'required' => false, 'description' => 'Тип карточки Twitter, например summary'],
                    ['name' => 'json_ld', 'type' => 'object', 'required' => false, 'description' => 'Разметка JSON-LD материала'],
                ],
            ],
        ];
    }
}
