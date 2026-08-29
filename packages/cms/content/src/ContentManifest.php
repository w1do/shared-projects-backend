<?php

declare(strict_types=1);

namespace Cms\Content;

use Cms\Contracts\Manifest\NavigationItem;
use Cms\Contracts\Manifest\PermissionDefinition;
use Cms\Contracts\Manifest\ServiceManifest;
use Cms\Contracts\Manifest\SettingDefinition;

final class ContentManifest
{
    public const VERSION = '0.3.0';

    public static function build(): ServiceManifest
    {
        return new ServiceManifest(
            key: 'content',
            version: self::VERSION,
            permissions: [
                new PermissionDefinition('content.posts.view', 'Просмотр постов', 'posts'),
                new PermissionDefinition('content.posts.manage', 'Управление постами', 'posts'),
                new PermissionDefinition('content.posts.publish', 'Публикация постов', 'posts'),
                new PermissionDefinition('content.pages.view', 'Просмотр страниц', 'pages'),
                new PermissionDefinition('content.pages.manage', 'Управление страницами', 'pages'),
                new PermissionDefinition('content.categories.view', 'Просмотр категорий', 'categories'),
                new PermissionDefinition('content.categories.manage', 'Управление категориями', 'categories'),
                new PermissionDefinition('content.seo.manage', 'Управление SEO', 'seo'),
                new PermissionDefinition('content.media.view', 'Просмотр медиа', 'media'),
                new PermissionDefinition('content.translations.view', 'Просмотр переводов', 'translations'),
                new PermissionDefinition('content.translations.manage', 'Управление переводами', 'translations'),
                new PermissionDefinition('content.media.manage', 'Загрузка медиа', 'media'),
                new PermissionDefinition('content.research.view', 'Просмотр исследований', 'research'),
                new PermissionDefinition('content.research.run', 'Запуск исследований', 'research'),
                new PermissionDefinition('content.topics.view', 'Просмотр тем', 'topics'),
                new PermissionDefinition('content.topics.manage', 'Управление темами', 'topics'),
                new PermissionDefinition('content.instructs.view', 'Просмотр инструкций', 'instructs'),
                new PermissionDefinition('content.instructs.manage', 'Управление инструкциями', 'instructs'),
                new PermissionDefinition('content.tasks.view', 'Просмотр фоновых задач', 'tasks'),
            ],
            navigation: [
                new NavigationItem('content.posts', 'nav.content.posts', '/content/posts', 'content.posts.view', 'file-text', 20),
                new NavigationItem('content.pages', 'nav.content.pages', '/content/pages', 'content.pages.view', 'layout', 21),
                new NavigationItem('content.categories', 'nav.content.categories', '/content/categories', 'content.categories.view', 'folder-tree', 22),
                new NavigationItem('content.media', 'nav.content.media', '/content/media', 'content.media.view', 'image', 23),
                new NavigationItem('content.research', 'nav.content.research', '/content/research', 'content.research.view', 'search', 24),
                new NavigationItem('content.instructs', 'nav.content.instructs', '/content/instructs', 'content.instructs.view', 'list-checks', 25),
            ],
            settings: [
                new SettingDefinition('site_url', 'string', 'URL сайта проекта', null, ['url']),
                new SettingDefinition('cache_ttl', 'integer', 'TTL кэша контента, сек', 300, ['integer', 'min:0']),
            ],
        );
    }
}
