<?php

declare(strict_types=1);

namespace Cms\Auth\Domain\Policies;

use Illuminate\Auth\Access\Response;
use Illuminate\Contracts\Config\Repository as Config;
use Spatie\Permission\Models\Role;

/**
 * Правила изменения ролей проекта. Системные роли (шаблоны из конфигурации)
 * не редактируются и не удаляются: их состав пере-раскрывается из манифестов
 * при каждой публикации, любая ручная правка была бы затёрта.
 *
 * Policy вызывается контроллером напрямую, а не через `Gate`, сознательно:
 * в провайдере стоит `Gate::before`, пропускающий супер-админа мимо любой
 * проверки, — через Gate супер-админ смог бы сломать системную роль, чего
 * сегодня не может никто. Сообщения отказа — часть контракта ответа (403).
 */
final class RolePolicy
{
    public function __construct(private readonly Config $config) {}

    public function update(Role $role): Response
    {
        return $this->isSystem($role)
            ? Response::deny('System roles cannot be modified.')
            : Response::allow();
    }

    public function delete(Role $role): Response
    {
        return $this->isSystem($role)
            ? Response::deny('System roles cannot be deleted.')
            : Response::allow();
    }

    public function isSystem(Role $role): bool
    {
        return array_key_exists($role->name, (array) $this->config->get('cms-auth.system_roles', []));
    }
}
