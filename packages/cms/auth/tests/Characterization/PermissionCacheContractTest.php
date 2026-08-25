<?php

declare(strict_types=1);

use Cms\Auth\Application\Commands\ToggleServiceCommand;
use Cms\Auth\Application\Handlers\ToggleServiceHandler;
use Cms\Auth\Domain\Models\Admin;
use Cms\Auth\Infrastructure\Persistence\PermissionSyncer;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

/**
 * Характеризация инварианта И10: публикация манифеста с новым правом обязана дойти
 * до оператора, у которого кэш прав spatie уже прогрет в этом же процессе.
 * Защищает вызовы PermissionSyncer::forgetCachedPermissions() (:30 и :65)
 * при извлечении AdminPermissionResolver.
 *
 * Про фальсифицируемость. В spatie 8.3 модели Permission и Role используют трейт
 * RefreshesPermissionCache: любое их сохранение и Role::givePermissionTo сами сбрасывают
 * тот же общий кэш. Поэтому «обычный» сценарий (манифест с новым правом) остаётся зелёным
 * даже с закомментированными обоими вызовами — spatie маскирует их пропажу. Два последних
 * теста в файле собраны так, чтобы событий-масок не было и вызов оставался единственным
 * инвалидатором: без него они краснеют (проверено мутационно).
 */
beforeEach(function () {
    config(['cms.service_token' => 'test-service-token']);
    syncAuthManifest();
});

function permissionCacheServiceHeaders(): array
{
    return ['Authorization' => 'Service test-service-token'];
}

/** Манифест content: v1 — одно право/один пункт, v2 — добавлены reports. */
function permissionCacheManifest(string $version, bool $withReports): array
{
    $permissions = [
        ['key' => 'content.posts.view', 'label' => 'View posts', 'group' => 'posts'],
    ];
    $navigation = [
        ['key' => 'content.posts', 'label' => 'nav.posts', 'route' => '/content/posts', 'permission' => 'content.posts.view'],
    ];

    if ($withReports) {
        $permissions[] = ['key' => 'content.reports.view', 'label' => 'View reports', 'group' => 'reports'];
        $navigation[] = ['key' => 'content.reports', 'label' => 'nav.reports', 'route' => '/content/reports', 'permission' => 'content.reports.view'];
    }

    return [
        'key' => 'content',
        'version' => $version,
        'permissions' => $permissions,
        'navigation' => $navigation,
    ];
}

/** Сырое содержимое кэша прав spatie (null — кэш сброшен). */
function permissionCacheRaw(): mixed
{
    return app(PermissionRegistrar::class)
        ->getCacheRepository()
        ->get(config('permission.cache.key'));
}

/** Прогрев кэша прав spatie тем же путём, что RequirePermission. */
function permissionCacheWarm(Admin $admin, string $projectId): void
{
    $registrar = app(PermissionRegistrar::class);
    $previousTeam = $registrar->getPermissionsTeamId();
    $registrar->setPermissionsTeamId($projectId);

    try {
        $admin->unsetRelation('roles');
        $admin->hasPermissionTo('auth.members.view');
    } finally {
        $registrar->setPermissionsTeamId($previousTeam);
    }
}

/** Право, попавшее в БД мимо Eloquent-события (миграция/сид/прямой SQL). */
function permissionCacheInsertRawPermission(string $name): int
{
    return (int) DB::table('permissions')->insertGetId([
        'name' => $name,
        'guard_name' => 'admin',
        'label' => 'Raw permission',
        'group' => 'raw',
        'created_at' => now(),
        'updated_at' => now(),
    ]);
}

test('guard: 0.12 published permission reaches operator whose permission cache is warm', function () {
    $owner = Admin::factory()->create(['email' => 'owner@example.com', 'name' => 'Owner']);
    $project = createProjectFor($owner, 'permcache');
    app(ToggleServiceHandler::class)->handle(new ToggleServiceCommand($project, 'content', true));

    $this->postJson('/internal/manifests', permissionCacheManifest('1.0.0', false), permissionCacheServiceHeaders())
        ->assertOk();

    // Прогрев: запрос через RequirePermission заставляет spatie загрузить и закэшировать права.
    $this->getJson("/api/admin/v1/projects/{$project->key}/members", adminHeaders($owner))->assertOk();

    // Кэш действительно прогрет и в нём заведомо нет нового права — иначе тест был бы пустым.
    $warm = permissionCacheRaw();
    expect($warm)->not->toBeNull()
        ->and(json_encode($warm))->toContain('content.posts.view')
        ->and(json_encode($warm))->not->toContain('content.reports.view');

    // Публикация манифеста с ДОБАВЛЕННЫМ правом и закрытым им пунктом навигации.
    $this->postJson('/internal/manifests', permissionCacheManifest('1.1.0', true), permissionCacheServiceHeaders())
        ->assertOk()
        ->assertJsonPath('data.version', '1.1.0');

    // (1) право заведено и привязано к системной роли owner этого проекта.
    $this->assertDatabaseHas('permissions', ['name' => 'content.reports.view', 'guard_name' => 'admin']);

    $ownerRole = Role::query()
        ->where('project_id', $project->id)
        ->where('name', 'owner')
        ->firstOrFail();

    expect($ownerRole->permissions()->pluck('name')->all())
        ->toContain('content.posts.view')
        ->toContain('content.reports.view');

    // (2) оператор проходит проверку права под team-контекстом немедленно, без перезапуска процесса.
    $registrar = app(PermissionRegistrar::class);
    $previousTeam = $registrar->getPermissionsTeamId();
    $registrar->setPermissionsTeamId($project->id);

    try {
        $owner->unsetRelation('roles');

        expect($owner->hasPermissionTo('content.reports.view'))->toBeTrue();
    } finally {
        $registrar->setPermissionsTeamId($previousTeam);
    }

    // (3) HTTP-эффект: bootstrap отдаёт право и пункт навигации, закрытый им.
    $boot = $this->getJson("/api/admin/v1/bootstrap?project={$project->key}", adminHeaders($owner))->assertOk();

    $navigation = collect($boot->json('data.services'))->firstWhere('key', 'content')['navigation'];

    expect(collect($navigation)->pluck('key')->all())
        ->toContain('content.posts')
        ->toContain('content.reports')
        ->and($boot->json('data.permissions'))
        ->toContain('content.reports.view');
});

test('guard: 0.12 publishing a manifest leaves no stale permission cache behind', function () {
    $owner = Admin::factory()->create(['email' => 'owner@example.com', 'name' => 'Owner']);
    $project = createProjectFor($owner, 'permcache');

    $this->postJson('/internal/manifests', permissionCacheManifest('1.0.0', false), permissionCacheServiceHeaders())
        ->assertOk();

    $this->getJson("/api/admin/v1/projects/{$project->key}/members", adminHeaders($owner))->assertOk();

    expect(permissionCacheRaw())->not->toBeNull();

    $this->postJson('/internal/manifests', permissionCacheManifest('1.1.0', true), permissionCacheServiceHeaders())
        ->assertOk();

    // После публикации кэш либо сброшен, либо уже содержит новое право: устаревшего снимка не остаётся.
    $after = permissionCacheRaw();
    $stale = $after !== null && ! str_contains((string) json_encode($after), 'content.reports.view');

    expect($stale)->toBeFalse();
});

test('guard: 0.12 permission added by a manifest is granted to system roles of every existing project', function () {
    $ownerA = Admin::factory()->create(['email' => 'owner-a@example.com', 'name' => 'Owner A']);
    $ownerB = Admin::factory()->create(['email' => 'owner-b@example.com', 'name' => 'Owner B']);
    $projectA = createProjectFor($ownerA, 'permcache-a');
    $projectB = createProjectFor($ownerB, 'permcache-b');

    $this->postJson('/internal/manifests', permissionCacheManifest('1.0.0', false), permissionCacheServiceHeaders())
        ->assertOk();

    $this->getJson("/api/admin/v1/projects/{$projectA->key}/members", adminHeaders($ownerA))->assertOk();

    $this->postJson('/internal/manifests', permissionCacheManifest('1.1.0', true), permissionCacheServiceHeaders())
        ->assertOk();

    foreach ([$projectA->id, $projectB->id] as $projectId) {
        // owner — шаблон "*", editor — шаблон "content.*": оба обязаны получить новое право.
        foreach (['owner', 'editor'] as $roleName) {
            $role = Role::query()
                ->where('project_id', $projectId)
                ->where('name', $roleName)
                ->firstOrFail();

            expect($role->permissions()->pluck('name')->all())->toContain('content.reports.view');
        }

        // analyst — шаблон "analytics.*": права content ему не достаются.
        $analyst = Role::query()
            ->where('project_id', $projectId)
            ->where('name', 'analyst')
            ->firstOrFail();

        expect($analyst->permissions()->pluck('name')->all())->not->toContain('content.reports.view');
    }
});

/**
 * Фальсифицируемый guard на PermissionSyncer:30 (сброс до раскрытия шаблонов ролей).
 * Право лежит в БД, но в кэш не попало: событий RefreshesPermissionCache нет, и раскрытие
 * шаблонов читает права через findByName из кэша. Без сброса на :30 публикация манифеста
 * падает PermissionDoesNotExist (500) вместо 200.
 */
test('guard: 0.12 manifest publish expands role templates over a permission the warm cache never saw', function () {
    $owner = Admin::factory()->create(['email' => 'owner@example.com', 'name' => 'Owner']);
    $project = createProjectFor($owner, 'permcache');

    permissionCacheWarm($owner, $project->id);
    expect(permissionCacheRaw())->not->toBeNull();

    permissionCacheInsertRawPermission('content.raw.view');

    // прямой INSERT не сбрасывает кэш spatie: снимок остался «до вставки»
    expect(permissionCacheRaw())->not->toBeNull()
        ->and(json_encode(permissionCacheRaw()))->not->toContain('content.raw.view');

    $this->postJson('/internal/manifests', [
        'key' => 'content',
        'version' => '1.0.0',
        'permissions' => [],
        'navigation' => [],
    ], permissionCacheServiceHeaders())->assertOk();

    $ownerRole = Role::query()
        ->where('project_id', $project->id)
        ->where('name', 'owner')
        ->firstOrFail();

    expect($ownerRole->permissions()->pluck('name')->all())->toContain('content.raw.view');
});

/**
 * Фальсифицируемый guard на PermissionSyncer:65 (сброс в finally после team-id-swap).
 * Системных ролей на проект в конфиге нет — цикл ролей пуст, значит ни одно событие spatie
 * кэш не сбросит и вызов в finally остаётся единственным инвалидатором. Без него оператор
 * с прогретым кэшем не видит право, появившееся в БД, и получает отказ.
 */
test('guard: 0.12 syncSystemRoles invalidates the permission cache even when it touches no role', function () {
    $owner = Admin::factory()->create(['email' => 'owner@example.com', 'name' => 'Owner']);
    $project = createProjectFor($owner, 'permcache');

    $ownerRole = Role::query()
        ->where('project_id', $project->id)
        ->where('name', 'owner')
        ->firstOrFail();

    config(['cms-auth.system_roles' => ['super-admin' => []]]);

    permissionCacheWarm($owner, $project->id);
    expect(permissionCacheRaw())->not->toBeNull();

    $permissionId = permissionCacheInsertRawPermission('content.raw.view');
    DB::table('role_has_permissions')->insert([
        'permission_id' => $permissionId,
        'role_id' => $ownerRole->id,
    ]);

    // изменения в БД есть, прогретый кэш о них не знает
    expect(json_encode(permissionCacheRaw()))->not->toContain('content.raw.view');

    app(PermissionSyncer::class)->syncSystemRoles($project);

    expect(permissionCacheRaw())->toBeNull();

    $registrar = app(PermissionRegistrar::class);
    $previousTeam = $registrar->getPermissionsTeamId();
    $registrar->setPermissionsTeamId($project->id);

    try {
        $owner->unsetRelation('roles');

        expect($owner->hasPermissionTo('content.raw.view'))->toBeTrue();
    } finally {
        $registrar->setPermissionsTeamId($previousTeam);
    }
});
