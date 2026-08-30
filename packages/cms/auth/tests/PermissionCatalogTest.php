<?php

declare(strict_types=1);

use Cms\Auth\Domain\Enums\Guard;
use Cms\Auth\Domain\Models\Admin;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    syncAuthManifest();

    Permission::query()->create([
        'name' => 'pay.plans.view',
        'guard_name' => Guard::Admin->value,
        'label' => 'Просмотр планов',
        'group' => 'plans',
    ]);
});

/** @return list<string> ключи прав в каталоге проекта */
function catalogKeys(array $entries): array
{
    return array_values(array_map(fn (array $entry) => $entry['key'], $entries));
}

test('the catalog carries the label, the group and the service of every permission', function () {
    $admin = Admin::factory()->create();
    $project = createProjectFor($admin, 'site-a');

    $entries = $this->getJson("/api/admin/v1/projects/{$project->key}/permissions", adminHeaders($admin))
        ->assertOk()
        ->json('data');

    $roles = collect($entries)->firstWhere('key', 'auth.roles.view');

    expect($roles)->toBe([
        'key' => 'auth.roles.view',
        'label' => 'Просмотр ролей',
        'group' => 'roles',
        'service' => 'auth',
    ]);
});

test('permissions of a disabled service are not offered', function () {
    $admin = Admin::factory()->create();
    $project = createProjectFor($admin, 'site-a');
    $headers = adminHeaders($admin);

    $disabled = $this->getJson("/api/admin/v1/projects/{$project->key}/permissions", $headers)->assertOk()->json('data');
    expect(catalogKeys($disabled))->not->toContain('pay.plans.view')
        ->and(catalogKeys($disabled))->toContain('auth.roles.view');

    $this->putJson("/api/admin/v1/projects/{$project->key}/services/pay", ['enabled' => true], $headers)->assertOk();

    $enabled = $this->getJson("/api/admin/v1/projects/{$project->key}/permissions", $headers)->assertOk()->json('data');
    expect(catalogKeys($enabled))->toContain('pay.plans.view');
});

test('a role keeps a permission of a service that was switched off', function () {
    $admin = Admin::factory()->create();
    $project = createProjectFor($admin, 'site-a');
    $headers = adminHeaders($admin);

    $this->putJson("/api/admin/v1/projects/{$project->key}/services/pay", ['enabled' => true], $headers)->assertOk();

    $this->postJson("/api/admin/v1/projects/{$project->key}/roles", [
        'name' => 'biller',
        'permissions' => ['pay.plans.view'],
    ], $headers)->assertCreated();

    $this->putJson("/api/admin/v1/projects/{$project->key}/services/pay", ['enabled' => false], $headers)->assertOk();

    $roles = $this->getJson("/api/admin/v1/projects/{$project->key}/roles", $headers)->assertOk()->json('data');
    $biller = collect($roles)->firstWhere('name', 'biller');

    expect($biller['permissions'])->toBe(['pay.plans.view'])
        ->and(catalogKeys($this->getJson("/api/admin/v1/projects/{$project->key}/permissions", $headers)->json('data')))
        ->not->toContain('pay.plans.view');
});

test('the catalog is closed without auth.roles.view', function () {
    $owner = Admin::factory()->create();
    $project = createProjectFor($owner, 'site-a');

    $member = Admin::factory()->create();
    $project->members()->attach($member->id);

    $role = Role::query()->create([
        'name' => 'members-only',
        'guard_name' => Guard::Admin->value,
        'project_id' => $project->id,
    ]);
    $role->syncPermissions(['auth.members.view']);

    $registrar = app(PermissionRegistrar::class);
    $registrar->setPermissionsTeamId($project->id);
    $member->assignRole('members-only');
    $registrar->setPermissionsTeamId(null);

    $this->getJson("/api/admin/v1/projects/{$project->key}/permissions", adminHeaders($member))->assertStatus(403);
});

test('an unknown service prefix stays in the catalog', function () {
    $admin = Admin::factory()->create();
    $project = createProjectFor($admin, 'site-a');

    Permission::query()->create([
        'name' => 'reporting.exports.view',
        'guard_name' => Guard::Admin->value,
        'label' => 'Просмотр выгрузок',
        'group' => 'exports',
    ]);

    $entries = $this->getJson("/api/admin/v1/projects/{$project->key}/permissions", adminHeaders($admin))
        ->assertOk()
        ->json('data');

    expect(catalogKeys($entries))->toContain('reporting.exports.view');
});

test('a role name already used in the project is rejected with a validation error', function () {
    $admin = Admin::factory()->create();
    $project = createProjectFor($admin, 'site-a');
    $headers = adminHeaders($admin);

    $payload = ['name' => 'moderator', 'permissions' => ['auth.users.view']];

    $this->postJson("/api/admin/v1/projects/{$project->key}/roles", $payload, $headers)->assertCreated();

    $this->postJson("/api/admin/v1/projects/{$project->key}/roles", $payload, $headers)
        ->assertStatus(422)
        ->assertJsonPath('error.details.name.0', 'This role name is already used in the project.');

    expect(Role::query()->where('project_id', $project->id)->where('name', 'moderator')->count())->toBe(1);
});
