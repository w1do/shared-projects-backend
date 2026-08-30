<?php

declare(strict_types=1);

namespace Cms\Instructs\Infrastructure\Persistence;

use Cms\Instructs\Domain\Enums\InstructCategory;

/**
 * Предустановленные инструкции платформы: применяются, когда своя инструкция
 * категории в проекте не заведена. Единственное место, где живёт их состав.
 */
final class SystemInstructCatalog
{
    /** @return list<array{category: InstructCategory, title: string, rule: string, schema: array<string, mixed>}> */
    public static function all(): array
    {
        return [
            [
                'category' => InstructCategory::ProjectDescription,
                'title' => 'Сборка проекта по теме',
                'rule' => 'Ты помогаешь запустить контентный проект. По заданной тематике опиши проект в 3–5 предложениях, укажи его тему одной строкой и собери дерево категорий: понятные названия на языке проекта и латинские slug в kebab-case. Вложенность задаётся через parent_slug (null у корневых). Slug уникальны.',
                'schema' => [
                    'type' => 'object',
                    'properties' => [
                        'description' => ['type' => 'string', 'description' => 'Описание проекта'],
                        'topic' => ['type' => 'string', 'description' => 'Тематика проекта одной строкой'],
                        'categories' => self::categoriesProperty(),
                    ],
                    'required' => ['description', 'topic', 'categories'],
                ],
            ],
            [
                'category' => InstructCategory::CategoryTree,
                'title' => 'Дерево категорий проекта',
                'rule' => 'Собери дерево категорий для описанного проекта: понятные названия на языке проекта и латинские slug в kebab-case. Вложенность задаётся через parent_slug (null у корневых). Slug уникальны.',
                'schema' => [
                    'type' => 'object',
                    'properties' => ['categories' => self::categoriesProperty()],
                    'required' => ['categories'],
                ],
            ],
            [
                'category' => InstructCategory::PostTopics,
                'title' => 'Темы постов по материалам ресёрча',
                'rule' => 'Преврати собранный материал в темы отдельных публикаций. Каждая тема выводится только из переданных материалов. Для каждой темы дай заголовок, одно-два предложения о том, чем она интересна, и категорию: из категорий проекта, если подходит, иначе предложи новую.',
                'schema' => [
                    'type' => 'object',
                    'properties' => [
                        'topics' => [
                            'type' => 'array',
                            // Число тем задаёт инструкция: обработчик читает maxItems
                            'maxItems' => 10,
                            'items' => [
                                'type' => 'object',
                                'properties' => [
                                    'title' => ['type' => 'string'],
                                    'rationale' => ['type' => 'string'],
                                    'category' => ['type' => ['string', 'null']],
                                ],
                                'required' => ['title', 'rationale', 'category'],
                            ],
                        ],
                    ],
                    'required' => ['topics'],
                ],
            ],
            [
                'category' => InstructCategory::PostBody,
                'title' => 'Текст поста по теме',
                'rule' => 'Напиши пост по заданной теме, опираясь только на переданные материалы. Дай заголовок, латинский slug в kebab-case и разбей содержимое не менее чем на 10 блоков: у каждого своё короткое название и текст в markdown. Раскрой все подтемы переданного материала, не пропуская ни одной. Общий объём текста блоков — не менее 8000 символов: это развёрнутая статья, а не пересказ; каждый блок пиши подробно, с примерами и деталями из материалов. Один блок — одна смысловая часть темы, например «Какие бывают авто» или «Что нужно знать при выборе двигателя». Не выдумывай фактов, которых нет в материалах.',
                'schema' => [
                    'type' => 'object',
                    'properties' => [
                        'title' => ['type' => 'string'],
                        'slug' => ['type' => 'string'],
                        'blocks' => [
                            'type' => 'array',
                            // Число блоков читает обработчик генерации: ответ короче отклоняется
                            'minItems' => 10,
                            'items' => [
                                'type' => 'object',
                                'properties' => [
                                    'title' => ['type' => 'string'],
                                    // Нижняя граница блока подпирает общий объём поста
                                    'markdown' => ['type' => 'string', 'minLength' => 600],
                                ],
                                'required' => ['title', 'markdown'],
                            ],
                            'description' => 'Части поста: название и развёрнутый текст в markdown, не меньше 10 штук',
                        ],
                        'tags' => [
                            'type' => 'array',
                            'items' => ['type' => 'string'],
                            'description' => 'Теги поста, 3–7 штук',
                        ],
                    ],
                    'required' => ['title', 'slug', 'blocks', 'tags'],
                ],
            ],
            [
                'category' => InstructCategory::PostSeo,
                'title' => 'SEO-поля поста',
                'rule' => 'Заполни SEO-поля для готового поста: заголовок до 60 символов, описание до 160 символов, ключевые слова через запятую и поля для соцсетей — заголовок и описание Open Graph, тип карточки Twitter (summary или summary_large_image). Опирайся на текст поста, не выдумывай фактов.',
                'schema' => self::seoProperties(),
            ],
            [
                'category' => InstructCategory::CategorySeo,
                'title' => 'SEO-поля категории',
                'rule' => 'Заполни SEO-поля для категории каталога: заголовок до 60 символов, описание до 160 символов, ключевые слова через запятую и поля для соцсетей — заголовок и описание Open Graph, тип карточки Twitter (summary или summary_large_image). Опирайся на название и описание категории, не выдумывай фактов.',
                'schema' => self::seoProperties(),
            ],
        ];
    }

    /** Схема текстовых SEO-полей: адреса, robots и JSON-LD остаются за оператором. */
    private static function seoProperties(): array
    {
        return [
            'type' => 'object',
            'properties' => [
                'title' => ['type' => 'string', 'maxLength' => 60],
                'description' => ['type' => 'string', 'maxLength' => 160],
                'keywords' => ['type' => 'string'],
                'og_title' => ['type' => 'string', 'maxLength' => 60],
                'og_description' => ['type' => 'string', 'maxLength' => 160],
                'twitter_card' => ['type' => 'string', 'enum' => ['summary', 'summary_large_image']],
            ],
            'required' => ['title', 'description', 'keywords', 'og_title', 'og_description', 'twitter_card'],
        ];
    }

    /** @return array<string, mixed> */
    private static function categoriesProperty(): array
    {
        return [
            'type' => 'array',
            'items' => [
                'type' => 'object',
                'properties' => [
                    'name' => ['type' => 'string'],
                    'slug' => ['type' => 'string'],
                    'parent_slug' => ['type' => ['string', 'null']],
                ],
                'required' => ['name', 'slug', 'parent_slug'],
            ],
        ];
    }
}
