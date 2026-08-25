<?php

declare(strict_types=1);

namespace Cms\Auth\Domain\Enums;

/**
 * Guard'ы платформы: оператор консоли и пользователь сайта.
 *
 * Имя guard'а — не косметика: оно разделяет пространства reset-токенов и прав
 * (`password_reset_tokens.guard`, `permissions.guard_name`), поэтому опечатка в
 * литерале тихо создала бы вторую, никем не читаемую вселенную записей.
 */
enum Guard: string
{
    case Admin = 'admin';
    case Web = 'web';
}
