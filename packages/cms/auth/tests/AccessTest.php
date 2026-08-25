<?php

declare(strict_types=1);

use Cms\Auth\Domain\Models\Admin;
use Cms\Auth\Infrastructure\Support\PermissionSyncer;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    syncAuthManifest();
});

test('manifest sync seeds permissions and system roles per project', function () {
    $admin = Admin::factory()->create();
    $project = createProjectFor($admin);

    expect(Permission::query()->where('name', 'auth.members.manage')->exists())->toBeTrue()
        ->and(Role::query()->where('project_id', $project->id)->pluck('name'))
        ->toContain('owner', 'admin', 'editor', 'analyst', 'viewer');

    // owner получает все права
    $owner = Role::query()->where('project_id', $project->id)->where('name', 'owner')->first();
    expect($owner->permissions()->count())->toBe(Permission::query()->count());
});

test('permission in project A does not grant access in project B', function () {
    $owner = Admin::factory()->create();
    $a = createProjectFor($owner, 'proj-a');
    $b = createProjectFor($owner, 'proj-b');

    $editor = Admin::factory()->create();
    $a->members()->attach($editor->id);
    app(PermissionRegistrar::class)->setPermissionsTeamId($a->id);
    $editor->assignRole('admin');
    app(PermissionRegistrar::class)->setPermissionsTeamId(null);

    $headers = adminHeaders($editor);

    $this->getJson("/api/admin/v1/projects/{$a->key}/members", $headers)->assertOk();
    // Не участник B: 404, существование не раскрывается
    $this->getJson("/api/admin/v1/projects/{$b->key}/members", $headers)->assertNotFound();
});

test('viewer role cannot manage members', function () {
    $owner = Admin::factory()->create();
    $project = createProjectFor($owner);

    $viewer = Admin::factory()->create();
    $project->members()->attach($viewer->id);
    app(PermissionRegistrar::class)->setPermissionsTeamId($project->id);
    $viewer->assignRole('viewer');
    app(PermissionRegistrar::class)->setPermissionsTeamId(null);

    $headers = adminHeaders($viewer);

    // *.view есть
    $this->getJson("/api/admin/v1/projects/{$project->key}/members", $headers)->assertOk();
    // manage — нет
    $this->postJson("/api/admin/v1/projects/{$project->key}/members", [
        'email' => $owner->email, 'role' => 'viewer',
    ], $headers)->assertStatus(403);
});

test('super-admin passes every check in every project', function () {
    $owner = Admin::factory()->create();
    $project = createProjectFor($owner);

    $root = Admin::factory()->create();
    PermissionSyncer::grantSuperAdmin($root);

    $this->getJson("/api/admin/v1/projects/{$project->key}/members", adminHeaders($root))->assertOk();
    $this->putJson("/api/admin/v1/projects/{$project->key}/services/content", ['enabled' => true], adminHeaders($root))->assertOk();
});

test('revoking a role takes effect on the next request', function () {
    $owner = Admin::factory()->create();
    $project = createProjectFor($owner);

    $member = Admin::factory()->create();
    $project->members()->attach($member->id);
    $registrar = app(PermissionRegistrar::class);
    $registrar->setPermissionsTeamId($project->id);
    $member->assignRole('admin');
    $registrar->setPermissionsTeamId(null);

    $headers = adminHeaders($member);
    $this->getJson("/api/admin/v1/projects/{$project->key}/members", $headers)->assertOk();

    $registrar->setPermissionsTeamId($project->id);
    $member->syncRoles([]);
    $registrar->setPermissionsTeamId(null);

    $this->getJson("/api/admin/v1/projects/{$project->key}/members", $headers)->assertStatus(403);
});

test('custom role crud via api', function () {
    $owner = Admin::factory()->create();
    $project = createProjectFor($owner);
    $headers = adminHeaders($owner);

    $created = $this->postJson("/api/admin/v1/projects/{$project->key}/roles", [
        'name' => 'moderator',
        'permissions' => ['auth.users.view', 'auth.users.manage'],
    ], $headers)->assertCreated();

    $roleId = $created->json('data.id');

    $this->putJson("/api/admin/v1/projects/{$project->key}/roles/{$roleId}", [
        'permissions' => ['auth.users.view'],
    ], $headers)->assertOk()->assertJsonCount(1, 'data.permissions');

    // Системную роль нельзя менять
    $ownerRole = Role::query()->where('project_id', $project->id)->where('name', 'owner')->first();
    $this->deleteJson("/api/admin/v1/projects/{$project->key}/roles/{$ownerRole->id}", [], $headers)->assertStatus(403);

    $this->deleteJson("/api/admin/v1/projects/{$project->key}/roles/{$roleId}", [], $headers)->assertNoContent();
});

test('inviting an unknown email creates the operator account', function () {
    $owner = Admin::factory()->create();
    $project = createProjectFor($owner);

    expect(Admin::query()->where('email', 'newcomer@example.com')->exists())->toBeFalse();

    $this->postJson("/api/admin/v1/projects/{$project->key}/members", [
        'email' => 'newcomer@example.com', 'name' => 'Newcomer', 'role' => 'editor',
    ], adminHeaders($owner))->assertCreated();

    $member = Admin::query()->where('email', 'newcomer@example.com')->first();

    expect($member)->not->toBeNull()
        ->and($member->name)->toBe('Newcomer')
        ->and($project->hasMember($member))->toBeTrue();
});

test('unknown role is rejected without leaving an orphan account', function () {
    $owner = Admin::factory()->create();
    $project = createProjectFor($owner);

    $this->postJson("/api/admin/v1/projects/{$project->key}/members", [
        'email' => 'orphan@example.com', 'name' => 'Orphan', 'role' => 'manager',
    ], adminHeaders($owner))->assertStatus(422);

    expect(Admin::query()->where('email', 'orphan@example.com')->exists())->toBeFalse();
});

test('inviting the same person twice is rejected', function () {
    $owner = Admin::factory()->create();
    $project = createProjectFor($owner);

    $payload = ['email' => 'twice@example.com', 'name' => 'Twice', 'role' => 'viewer'];

    $this->postJson("/api/admin/v1/projects/{$project->key}/members", $payload, adminHeaders($owner))
        ->assertCreated();
    $this->postJson("/api/admin/v1/projects/{$project->key}/members", $payload, adminHeaders($owner))
        ->assertStatus(422);

    expect(Admin::query()->where('email', 'twice@example.com')->count())->toBe(1);
});
