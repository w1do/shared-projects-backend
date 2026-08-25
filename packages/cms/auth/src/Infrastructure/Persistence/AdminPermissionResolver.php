<?php

declare(strict_types=1);

namespace Cms\Auth\Infrastructure\Persistence;

use Closure;
use Spatie\Permission\PermissionRegistrar;

/**
 * Единственное место, где переключается team-контекст spatie (team_id = project_id).
 * Раньше swap был скопирован в пяти местах, и каждая копия сама решала, что делать
 * с предыдущим значением — отсюда две разные семантики восстановления.
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

    /**
     * То же, но контекст сбрасывается в null, а не восстанавливается.
     *
     * Отдельный метод, потому что это не «более простая» форма withTeam(), а другое
     * наблюдаемое поведение: вложенный вызов потерял бы внешний team-контекст.
     * Используется там, где так было и до рефакторинга (CreateProjectHandler,
     * ResolveProject) — расхождение зафиксировано как дефект в задаче 9.2 и здесь
     * сохраняется дословно.
     *
     * @template TReturn
     *
     * @param  Closure(): TReturn  $body
     * @return TReturn
     */
    public function withTeamThenClear(string $projectId, Closure $body): mixed
    {
        $this->registrar->setPermissionsTeamId($projectId);

        try {
            return $body();
        } finally {
            $this->registrar->setPermissionsTeamId(null);
        }
    }
}
