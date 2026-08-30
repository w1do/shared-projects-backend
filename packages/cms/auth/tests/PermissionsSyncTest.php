<?php

declare(strict_types=1);

use Cms\Auth\Application\Commands\SyncPermissionsCommand;
use Cms\Auth\Application\Handlers\SyncPermissionsHandler;
use Cms\Auth\Domain\Enums\Guard;
use Cms\Auth\Domain\Models\Admin;
use Cms\Auth\Domain\Models\Project;
use Cms\Auth\Domain\Models\ServiceManifestRecord;
use Cms\Auth\Infrastructure\Persistence\PermissionSyncer;
use Cms\Auth\Presentation\Http\Middleware\RequirePermission;
use Cms\Contracts\Manifest\PermissionDefinition;
use Cms\Contracts\Manifest\ServiceManifest;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

beforeEach(fn () => syncAuthManifest());

/** Манифест, опубликованный сервисом: запись есть, каталог прав ещё не обновлён. */
function publishManifestRecord(ServiceManifest $manifest): void
{
    ServiceManifestRecord::query()->updateOrCreate(
        ['key' => $manifest->key],
        ['version' => $manifest->version, 'manifest' => $manifest->toArray()],
    );
}

function publishPayManifestRecord(): void
{
    publishManifestRecord(new ServiceManifest(
        key: 'pay',
        version: '0.1.0',
        permissions: [
            new PermissionDefinition('pay.plans.view', 'Просмотр планов', 'plans'),
            new PermissionDefinition('pay.plans.manage', 'Управление планами', 'plans'),
            new PermissionDefinition('pay.licensing.view', 'Просмотр лицензирования', 'licensing'),
        ],
    ));
}

function runPermissionsSync(bool $prune = false)
{
    return app(SyncPermissionsHandler::class)->handle(new SyncPermissionsCommand($prune));
}

/** Права контента и аналитики в каталоге: без них проверка права бросает PermissionDoesNotExist. */
function publishNeighbourManifestRecords(): void
{
    publishManifestRecord(new ServiceManifest(
        key: 'content',
        version: '0.1.0',
        permissions: [new PermissionDefinition('content.posts.view', 'Просмотр постов', 'posts')],
    ));

    publishManifestRecord(new ServiceManifest(
        key: 'analytics',
        version: '0.1.0',
        permissions: [new PermissionDefinition('analytics.reports.view', 'Просмотр отчётов', 'reports')],
    ));
}

/** @return list<string> права роли проекта */
function projectRolePermissions(Project $project, string $role): array
{
    $model = Role::query()
        ->where('project_id', $project->id)
        ->where('name', $role)
        ->firstOrFail();

    return array_values(array_map('strval', $model->permissions->pluck('name')->all()));
}

/** Пропускает ли middleware оператора к праву в проекте. */
function requirePermissionAllows(Admin $admin, Project $project, string $permission): bool
{
    $registrar = app(PermissionRegistrar::class);
    $registrar->setPermissionsTeamId($project->id);

    try {
        $request = Request::create('/');
        $request->setUserResolver(fn () => $admin);

        $response = (new RequirePermission)->handle($request, fn () => new Response('ok'), $permission);
    } finally {
        $registrar->setPermissionsTeamId(null);
    }

    return $response->getStatusCode() === 200;
}

test('sync spreads a new manifest permission across system roles of every project', function () {
    $admin = Admin::factory()->create();
    $a = createProjectFor($admin, 'proj-a');
    $b = createProjectFor($admin, 'proj-b');

    publishPayManifestRecord();

    $summary = runPermissionsSync();

    expect($summary->added)->toBe(3)
        ->and($summary->updated)->toBe(0)
        ->and($summary->orphans)->toBe([])
        ->and($summary->projects)->toBe(2);

    foreach ([$a, $b] as $project) {
        expect(projectRolePermissions($project, 'billing'))
            ->toEqualCanonicalizing(['pay.plans.view', 'pay.plans.manage', 'pay.licensing.view'])
            ->and(projectRolePermissions($project, 'licensing'))->toBe(['pay.licensing.view'])
            ->and(projectRolePermissions($project, 'editor'))->not->toContain('pay.plans.view');
    }
});

test('a second run in a row changes nothing', function () {
    $admin = Admin::factory()->create();
    createProjectFor($admin, 'proj-a');
    publishPayManifestRecord();

    runPermissionsSync();
    $permissions = Permission::query()->count();
    $roles = Role::query()->count();

    $summary = runPermissionsSync();

    expect($summary->added)->toBe(0)
        ->and($summary->updated)->toBe(0)
        ->and($summary->orphans)->toBe([])
        ->and(Permission::query()->count())->toBe($permissions)
        ->and(Role::query()->count())->toBe($roles);
});

test('a changed label counts as an update, not as an addition', function () {
    $admin = Admin::factory()->create();
    createProjectFor($admin, 'proj-a');
    publishPayManifestRecord();
    runPermissionsSync();

    publishManifestRecord(new ServiceManifest(
        key: 'pay',
        version: '0.2.0',
        permissions: [
            new PermissionDefinition('pay.plans.view', 'Планы: просмотр', 'plans'),
            new PermissionDefinition('pay.plans.manage', 'Управление планами', 'plans'),
            new PermissionDefinition('pay.licensing.view', 'Просмотр лицензирования', 'licensing'),
        ],
    ));

    $summary = runPermissionsSync();

    expect($summary->added)->toBe(0)->and($summary->updated)->toBe(1);
});

test('an orphan permission is reported and kept without the prune flag', function () {
    $admin = Admin::factory()->create();
    $project = createProjectFor($admin, 'proj-a');

    Permission::query()->create(['name' => 'ghost.thing.view', 'guard_name' => Guard::Admin->value]);
    $custom = Role::query()->create([
        'name' => 'ghost-hunter',
        'guard_name' => Guard::Admin->value,
        'project_id' => $project->id,
    ]);
    $custom->syncPermissions(['ghost.thing.view']);

    $summary = runPermissionsSync();

    expect($summary->orphans)->toBe(['ghost.thing.view'])
        ->and($summary->pruned)->toBeFalse()
        ->and(Permission::query()->where('name', 'ghost.thing.view')->exists())->toBeTrue()
        ->and(projectRolePermissions($project, 'ghost-hunter'))->toBe(['ghost.thing.view']);
});

test('prune deletes orphan permissions and detaches them from custom roles', function () {
    $admin = Admin::factory()->create();
    $project = createProjectFor($admin, 'proj-a');

    Permission::query()->create(['name' => 'ghost.thing.view', 'guard_name' => Guard::Admin->value]);
    $custom = Role::query()->create([
        'name' => 'ghost-hunter',
        'guard_name' => Guard::Admin->value,
        'project_id' => $project->id,
    ]);
    $custom->syncPermissions(['ghost.thing.view']);

    $summary = runPermissionsSync(prune: true);

    expect($summary->orphans)->toBe(['ghost.thing.view'])
        ->and($summary->pruned)->toBeTrue()
        ->and(Permission::query()->where('name', 'ghost.thing.view')->exists())->toBeFalse()
        ->and(projectRolePermissions($project, 'ghost-hunter'))->toBe([]);
});

test('permissions:sync prints the summary and honours --prune', function () {
    $admin = Admin::factory()->create();
    createProjectFor($admin, 'proj-a');
    Permission::query()->create(['name' => 'ghost.thing.view', 'guard_name' => Guard::Admin->value]);

    $this->artisan('permissions:sync')->assertSuccessful();
    expect(Permission::query()->where('name', 'ghost.thing.view')->exists())->toBeTrue();

    $this->artisan('permissions:sync', ['--prune' => true])->assertSuccessful();
    expect(Permission::query()->where('name', 'ghost.thing.view')->exists())->toBeFalse();
});

test('bootstrap shows the new permission set without a second login', function () {
    $admin = Admin::factory()->create();
    $project = createProjectFor($admin, 'proj-a');
    $headers = adminHeaders($admin);

    $this->putJson("/api/admin/v1/projects/{$project->key}/services/pay", ['enabled' => true], $headers)->assertOk();
    $before = $this->getJson("/api/admin/v1/bootstrap?project={$project->key}", $headers)->assertOk()->json('data.permissions');
    expect($before)->not->toContain('pay.plans.view');

    publishPayManifestRecord();
    runPermissionsSync();
    // Следующий запрос — новый воркер: guard внутри одного теста держит модель
    // оператора вместе с уже загруженным отношением ролей.
    $this->app['auth']->forgetGuards();

    $after = $this->getJson("/api/admin/v1/bootstrap?project={$project->key}", $headers)->assertOk()->json('data.permissions');
    expect($after)->toContain('pay.plans.view');
});

test('a service role carries only its own service, viewer only *.view', function () {
    $admin = Admin::factory()->create();
    $project = createProjectFor($admin, 'proj-a');
    publishPayManifestRecord();
    runPermissionsSync();

    $billing = projectRolePermissions($project, 'billing');
    $analyst = projectRolePermissions($project, 'analyst');
    $viewer = projectRolePermissions($project, 'viewer');

    expect($billing)->not->toBe([])
        ->and(array_filter($billing, fn (string $p) => ! str_starts_with($p, 'pay.')))->toBe([])
        ->and($analyst)->toBe([])
        ->and($viewer)->not->toBe([])
        ->and(array_filter($viewer, fn (string $p) => ! str_ends_with($p, '.view')))->toBe([]);
});

test('super-admin stays global and outside the project roles', function () {
    $admin = Admin::factory()->create();
    $project = createProjectFor($admin, 'proj-a');
    PermissionSyncer::ensureGlobalSuperAdminRole();

    runPermissionsSync();

    expect(Role::query()->where('project_id', $project->id)->pluck('name')->all())
        ->not->toContain('super-admin')
        ->and(Role::query()->whereNull('project_id')->where('name', 'super-admin')->exists())->toBeTrue();
});

test('a role added to the templates appears in every existing project', function () {
    $admin = Admin::factory()->create();
    $a = createProjectFor($admin, 'proj-a');
    $b = createProjectFor($admin, 'proj-b');

    config()->set('cms-auth.system_roles', config('cms-auth.system_roles') + ['moderator' => ['auth.users.*']]);

    runPermissionsSync();

    expect(projectRolePermissions($a, 'moderator'))->toEqualCanonicalizing(['auth.users.view', 'auth.users.manage'])
        ->and(projectRolePermissions($b, 'moderator'))->toEqualCanonicalizing(['auth.users.view', 'auth.users.manage']);
});

test('a member with the billing role reaches payments and nothing else', function () {
    $owner = Admin::factory()->create();
    $project = createProjectFor($owner, 'proj-a');
    publishPayManifestRecord();
    publishNeighbourManifestRecords();
    runPermissionsSync();

    $member = Admin::factory()->create();
    $project->members()->attach($member->id);
    $registrar = app(PermissionRegistrar::class);
    $registrar->setPermissionsTeamId($project->id);
    $member->assignRole('billing');
    $registrar->setPermissionsTeamId(null);

    expect(requirePermissionAllows($member, $project, 'pay.plans.view'))->toBeTrue()
        ->and(requirePermissionAllows($member, $project, 'content.posts.view'))->toBeFalse()
        ->and(requirePermissionAllows($member, $project, 'analytics.reports.view'))->toBeFalse()
        ->and(requirePermissionAllows($member, $project, 'auth.roles.view'))->toBeFalse();

    $this->getJson("/api/admin/v1/projects/{$project->key}/roles", adminHeaders($member))->assertStatus(403);
});
