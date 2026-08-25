<?php

declare(strict_types=1);

use Cms\Auth\Domain\Models\Admin;
use Cms\Auth\Domain\Models\Project;
use Cms\Auth\Domain\Models\User;
use Cms\Shared\Testing\ResponseSnapshot;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

/**
 * Задача 0.11 — характеризационные снимки кросс-проектного доступа.
 *
 * Инвариант И11: чужая запись обязана давать 404, а не 403 — существование
 * сущности другого проекта не раскрывается. Снимки фиксируют текущий контракт
 * целиком (статус + конверт error), чтобы ввод Policies (задача 6.6) не
 * превратил 404 в 403 и не подменил сообщение.
 *
 * Все запросы идут от имени owner проекта A, цель — сущности проекта B.
 */
beforeEach(function () {
    syncAuthManifest();
});

/**
 * Два независимых проекта: A с собственным owner и B с другим owner.
 * Owner A не является участником B и наоборот.
 *
 * @return array{0: Project, 1: Admin, 2: Project, 3: Admin}
 */
function crossProjectPair(): array
{
    $ownerA = Admin::factory()->create(['email' => 'owner-a@example.com', 'name' => 'Owner A']);
    $ownerB = Admin::factory()->create(['email' => 'owner-b@example.com', 'name' => 'Owner B']);

    $projectA = createProjectFor($ownerA, 'site-a');
    $projectB = createProjectFor($ownerB, 'site-b');

    return [$projectA, $ownerA, $projectB, $ownerB];
}

/** Участник проекта с явной ролью (без faker-значений в ассертах). */
function crossProjectMember(Project $project, string $email, string $name, string $role): Admin
{
    $member = Admin::factory()->create(['email' => $email, 'name' => $name]);
    $project->members()->attach($member->id);

    $registrar = app(PermissionRegistrar::class);
    $registrar->setPermissionsTeamId($project->id);
    $member->assignRole($role);
    $registrar->setPermissionsTeamId(null);

    return $member;
}

/** Роли участника в конкретном проекте (team-контекст spatie). */
function crossProjectRoleNames(Admin $member, Project $project): array
{
    $registrar = app(PermissionRegistrar::class);
    $registrar->setPermissionsTeamId($project->id);
    try {
        $names = $member->fresh()->roles()->pluck('name')->sort()->values()->all();
    } finally {
        $registrar->setPermissionsTeamId(null);
    }

    return $names;
}

test('guard: 0.11 member role assignment for a member of another project', function () {
    [$projectA, $ownerA, $projectB] = crossProjectPair();
    $foreignMember = crossProjectMember($projectB, 'member-b@example.com', 'Member B', 'viewer');

    $response = $this->putJson(
        "/api/admin/v1/projects/{$projectA->key}/members/{$foreignMember->id}/role",
        ['role' => 'editor'],
        adminHeaders($ownerA),
    );

    ResponseSnapshot::assertMatches($response, 'cross-project-member-assign-role');

    // Роль в чужом проекте не изменилась, участником A он не стал.
    expect(crossProjectRoleNames($foreignMember, $projectB))->toBe(['viewer'])
        ->and(crossProjectRoleNames($foreignMember, $projectA))->toBe([])
        ->and($projectA->hasMember($foreignMember))->toBeFalse();
});

test('guard: 0.11 member removal for a member of another project', function () {
    [$projectA, $ownerA, $projectB] = crossProjectPair();
    $foreignMember = crossProjectMember($projectB, 'member-b@example.com', 'Member B', 'viewer');

    $response = $this->deleteJson(
        "/api/admin/v1/projects/{$projectA->key}/members/{$foreignMember->id}",
        [],
        adminHeaders($ownerA),
    );

    ResponseSnapshot::assertMatches($response, 'cross-project-member-destroy');

    // Участник чужого проекта на месте вместе со своей ролью.
    expect($projectB->hasMember($foreignMember))->toBeTrue()
        ->and(crossProjectRoleNames($foreignMember, $projectB))->toBe(['viewer']);
});

test('guard: 0.11 role update for a custom role of another project', function () {
    [$projectA, $ownerA, $projectB] = crossProjectPair();

    $foreignRole = Role::query()->create([
        'name' => 'moderator-b',
        'guard_name' => 'admin',
        'project_id' => $projectB->id,
    ]);
    $foreignRole->syncPermissions(['auth.users.view', 'auth.users.manage']);

    $response = $this->putJson(
        "/api/admin/v1/projects/{$projectA->key}/roles/{$foreignRole->id}",
        ['permissions' => ['auth.audit.view']],
        adminHeaders($ownerA),
    );

    ResponseSnapshot::assertMatches($response, 'cross-project-role-update');

    // Права чужой роли не тронуты.
    expect($foreignRole->fresh()->permissions()->pluck('name')->sort()->values()->all())
        ->toBe(['auth.users.manage', 'auth.users.view']);
});

test('guard: 0.11 role update for a system role of another project', function () {
    [$projectA, $ownerA, $projectB] = crossProjectPair();

    $foreignOwnerRole = Role::query()
        ->where('project_id', $projectB->id)
        ->where('name', 'owner')
        ->firstOrFail();

    $response = $this->putJson(
        "/api/admin/v1/projects/{$projectA->key}/roles/{$foreignOwnerRole->id}",
        ['permissions' => ['auth.audit.view']],
        adminHeaders($ownerA),
    );

    // Чужая системная роль обязана быть неотличима от несуществующей:
    // проверка «системная роль» не должна опережать проверку принадлежности.
    ResponseSnapshot::assertMatches($response, 'cross-project-foreign-system-role-update');
});

test('guard: 0.11 own system role deletion returns the full forbidden envelope', function () {
    [$projectA, $ownerA] = crossProjectPair();

    $ownRole = Role::query()
        ->where('project_id', $projectA->id)
        ->where('name', 'owner')
        ->firstOrFail();

    $response = $this->deleteJson(
        "/api/admin/v1/projects/{$projectA->key}/roles/{$ownRole->id}",
        [],
        adminHeaders($ownerA),
    );

    ResponseSnapshot::assertMatches($response, 'cross-project-own-system-role-delete');

    // Конверт целиком: code/message/details/trace_id + сама роль на месте.
    expect(array_keys((array) $response->json('error')))
        ->toBe(['code', 'message', 'details', 'trace_id'])
        ->and($response->json('error.code'))->toBe('forbidden')
        ->and($response->json('error.message'))->toBe('System roles cannot be deleted.')
        ->and($response->json('error.details'))->toBe([])
        ->and($response->json('error.trace_id'))->toBeString()->not->toBe('')
        ->and(Role::query()->whereKey($ownRole->id)->exists())->toBeTrue();
});

test('guard: 0.11 site user block for a user of another project', function () {
    [$projectA, $ownerA, $projectB] = crossProjectPair();

    $foreignUser = User::factory()->create([
        'project_id' => $projectB->id,
        'email' => 'user-b@example.com',
        'name' => 'User B',
    ]);

    $response = $this->postJson(
        "/api/admin/v1/projects/{$projectA->key}/users/{$foreignUser->id}/block",
        [],
        adminHeaders($ownerA),
    );

    ResponseSnapshot::assertMatches($response, 'cross-project-user-block');

    // Пользователь чужого проекта не заблокирован.
    expect(User::acrossProjects()->whereKey($foreignUser->id)->first()->blocked_at)->toBeNull();
});
