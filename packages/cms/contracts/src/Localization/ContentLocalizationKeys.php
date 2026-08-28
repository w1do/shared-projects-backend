<?php

declare(strict_types=1);

namespace Cms\Contracts\Localization;

/** Ключи локализации сервиса content: навигация манифеста и карточка сервиса. */
enum ContentLocalizationKeys: string implements LocalizationKeys
{
    use EnumeratesKeys;

    case NavPosts = 'nav.content.posts';
    case NavPages = 'nav.content.pages';
    case NavCategories = 'nav.content.categories';
    case NavMedia = 'nav.content.media';
    case ServiceTitle = 'service.content.title';
    case ServiceDescription = 'service.content.description';

    public static function service(): string
    {
        return 'content';
    }

    public static function locale(): string
    {
        return 'ru';
    }

    public function defaultValue(): string
    {
        return match ($this) {
            self::NavPosts => 'Посты',
            self::NavPages => 'Страницы',
            self::NavCategories => 'Категории',
            self::NavMedia => 'Медиа',
            self::ServiceTitle => 'Контент',
            self::ServiceDescription => 'Посты, страницы, категории и медиабиблиотека',
        };
    }
}
