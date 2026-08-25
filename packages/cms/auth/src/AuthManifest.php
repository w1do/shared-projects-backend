<?php

declare(strict_types=1);

namespace Cms\Auth;

use Cms\Contracts\Manifest\NavigationItem;
use Cms\Contracts\Manifest\PermissionDefinition;
use Cms\Contracts\Manifest\ServiceManifest;

/** Декларация auth-модуля: права и навигация разделов управления доступом. */
final class AuthManifest
{
    public const VERSION = '0.1.0';

    public static function build(): ServiceManifest
    {
        return new ServiceManifest(
            key: 'auth',
            version: self::VERSION,
            permissions: [
                new PermissionDefinition('auth.projects.view', 'Просмотр проекта', 'projects'),
                new PermissionDefinition('auth.projects.manage', 'Управление проектом', 'projects'),
                new PermissionDefinition('auth.members.view', 'Просмотр участников', 'members'),
                new PermissionDefinition('auth.members.manage', 'Управление участниками', 'members'),
                new PermissionDefinition('auth.roles.view', 'Просмотр ролей', 'roles'),
                new PermissionDefinition('auth.roles.manage', 'Управление ролями', 'roles'),
                new PermissionDefinition('auth.keys.view', 'Просмотр API-ключей', 'keys'),
                new PermissionDefinition('auth.keys.manage', 'Управление API-ключами', 'keys'),
                new PermissionDefinition('auth.services.manage', 'Включение сервисов', 'services'),
                new PermissionDefinition('auth.settings.view', 'Просмотр настроек', 'settings'),
                new PermissionDefinition('auth.settings.manage', 'Управление настройками', 'settings'),
                new PermissionDefinition('auth.audit.view', 'Просмотр аудита', 'audit'),
                new PermissionDefinition('auth.users.view', 'Просмотр пользователей', 'users'),
                new PermissionDefinition('auth.users.manage', 'Управление пользователями', 'users'),
            ],
            navigation: [
                new NavigationItem('auth.members', 'nav.auth.members', '/members', 'auth.members.view', 'users', 80),
                new NavigationItem('auth.roles', 'nav.auth.roles', '/roles', 'auth.roles.view', 'shield', 81),
                new NavigationItem('auth.keys', 'nav.auth.keys', '/api-keys', 'auth.keys.view', 'key', 82),
                new NavigationItem('auth.users', 'nav.auth.users', '/users', 'auth.users.view', 'user', 83),
                new NavigationItem('auth.settings', 'nav.auth.settings', '/settings', 'auth.settings.view', 'settings', 84),
                new NavigationItem('auth.audit', 'nav.auth.audit', '/audit', 'auth.audit.view', 'history', 85),
            ],
        );
    }
}
