<?php

declare(strict_types=1);

namespace Cms\Instructs\Domain\Enums;

/** Сценарии генерации платформы: перечень закрыт, инструкция вне него не сохраняется. */
enum InstructCategory: string
{
    case ProjectDescription = 'project_description';
    case CategoryTree = 'category_tree';
    case PostTopics = 'post_topics';
    case PostBody = 'post_body';
    case PostSeo = 'post_seo';
    case CategorySeo = 'category_seo';

    public function label(): string
    {
        return match ($this) {
            self::ProjectDescription => 'Описание проекта',
            self::CategoryTree => 'Дерево категорий',
            self::PostTopics => 'Темы постов',
            self::PostBody => 'Текст поста',
            self::PostSeo => 'SEO поста',
            self::CategorySeo => 'SEO категории',
        };
    }

    /** @return list<string> */
    public static function values(): array
    {
        return array_map(static fn (self $case): string => $case->value, self::cases());
    }
}
