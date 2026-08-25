<?php

declare(strict_types=1);

namespace Cms\Auth\Domain\Enums;

/**
 * Коды действий журнала аудита.
 *
 * Значения — часть контракта: они уходят в ответ `GET /audit` и по ним строятся
 * фильтры панели, поэтому переименование кода — изменение контракта, а не рефакторинг.
 */
enum AuditAction: string
{
    case ProjectCreated = 'project.created';
    case ProjectUpdated = 'project.updated';
    case ProjectArchived = 'project.archived';

    case MemberInvited = 'member.invited';
    case MemberRoleChanged = 'member.role_changed';
    case MemberRemoved = 'member.removed';

    case AdminCreated = 'admin.created';
    case AdminProfileUpdated = 'admin.profile_updated';

    case RoleCreated = 'role.created';
    case RoleUpdated = 'role.updated';
    case RoleDeleted = 'role.deleted';

    case ApiKeyIssued = 'api_key.issued';
    case ApiKeyRevoked = 'api_key.revoked';

    case ServiceEnabled = 'service.enabled';
    case ServiceDisabled = 'service.disabled';

    case SettingsUpdated = 'settings.updated';

    case RolesSyncFailed = 'roles.sync_failed';

    case UserBlocked = 'user.blocked';
    case UserUnblocked = 'user.unblocked';
    case UserDeleted = 'user.deleted';
}
