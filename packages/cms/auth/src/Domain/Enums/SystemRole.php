<?php

declare(strict_types=1);

namespace Cms\Auth\Domain\Enums;

/**
 * Системные роли платформы.
 *
 * Состав прав каждой роли задаётся шаблонами в конфигурации и пере-раскрывается
 * из манифестов, поэтому источником списка остаётся `cms-auth.system_roles`;
 * enum фиксирует имена, на которые опирается код.
 */
enum SystemRole: string
{
    /** Глобальная роль: выдаётся вне teams-скоупа (project_id = ''). */
    case SuperAdmin = 'super-admin';
    case Owner = 'owner';
    case Admin = 'admin';
    case Editor = 'editor';
    case Analyst = 'analyst';
    case Viewer = 'viewer';
}
