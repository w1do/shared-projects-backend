<?php

declare(strict_types=1);

namespace Cms\Auth\Infrastructure\Persistence;

use Closure;
use Spatie\Permission\PermissionRegistrar;

/**
 * Единственное место, где переключается team-контекст spatie (team_id = project_id).
 * Раньше swap был скопирован в пяти местах с двумя разными семантиками восстановления;
 * с закрытием дефекта Д6 семантика одна: контекст всегда возвращается к предыдущему
 * значению, вложенные свопы не затирают внешний.
 *
 * Сброс кэша прав (`forgetCachedPermissions()`) в резолвер НЕ входит: это отдельный
 * эффект с другим сроком жизни (в проде store прав — redis с TTL 24 ч), его вызовы
 * остаются на местах вызывающего кода (инвариант И10).
 */
final class AdminPermissionResolver
{
    public function __construct(private readonly PermissionRegistrar $registrar) {}

    /**
     * Выполняет $body в team-контексте проекта и возвращает контекст к предыдущему значению.
     *
     * @template TReturn
     *
     * @param  Closure(): TReturn  $body
     * @return TReturn
     */
    public function withTeam(string $projectId, Closure $body): mixed
    {
        $previous = $this->registrar->getPermissionsTeamId();
        $this->registrar->setPermissionsTeamId($projectId);

        try {
            return $body();
        } finally {
            $this->registrar->setPermissionsTeamId($previous);
        }
    }
}
