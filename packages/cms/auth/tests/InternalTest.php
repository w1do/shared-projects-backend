<?php

declare(strict_types=1);

use Cms\Auth\Application\Commands\BlockUserCommand;
use Cms\Auth\Application\Commands\ToggleServiceCommand;
use Cms\Auth\Application\Handlers\BlockUserHandler;
use Cms\Auth\Application\Handlers\ToggleServiceHandler;
use Cms\Auth\Domain\Models\Admin;
use Cms\Auth\Domain\Models\ProjectApiKey;
use Cms\Auth\Domain\Models\User;
use Cms\Auth\Infrastructure\Persistence\PermissionSyncer;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    config(['cms.service_token' => 'test-service-token']);
    syncAuthManifest();
});

function serviceHeaders(): array
{
    return ['Authorization' => 'Service test-service-token'];
}

test('internal endpoints reject calls without a service token', function () {
    $this->postJson('/internal/introspect', ['token' => 'x'])->assertStatus(401);
    $this->postJson('/internal/manifests', ['key' => 'content', 'version' => '1.0.0'])->assertStatus(401);
});

test('manifest registration exposes new permissions to roles', function () {
    $payload = [
        'key' => 'content',
        'version' => '1.0.0',
        'permissions' => [
            ['key' => 'content.posts.view', 'label' => 'View posts', 'group' => 'posts'],
            ['key' => 'content.posts.publish', 'label' => 'Publish posts', 'group' => 'posts'],
        ],
        'navigation' => [
            ['key' => 'content.posts', 'label' => 'nav.posts', 'route' => '/content/posts', 'permission' => 'content.posts.view'],
        ],
    ];

    $this->postJson('/internal/manifests', $payload, serviceHeaders())->assertOk();

    $admin = Admin::factory()->create();
    $project = createProjectFor($admin, 'cms');

    // editor (шаблон content.*) получил новые права
    $editorRole = Role::query()
        ->where('project_id', $project->id)->where('name', 'editor')->first();
    expect($editorRole->permissions()->pluck('name'))->toContain('content.posts.view', 'content.posts.publish');
});

test('introspection resolves admin token with project permissions', function () {
    $admin = Admin::factory()->create();
    $project = createProjectFor($admin, 'intro');
    $token = $admin->createToken('t')->plainTextToken;

    $this->postJson('/internal/introspect', ['token' => $token, 'project' => 'intro'], serviceHeaders())
        ->assertOk()
        ->assertJsonPath('subject', 'admin')
        ->assertJsonPath('active', true)
        ->assertJsonPath('project_id', $project->id)
        ->assertJson(fn ($json) => $json->where('permissions', fn ($p) => collect($p)->contains('auth.members.view'))->etc());
});

test('introspection resolves site user token and blocks blocked users', function () {
    $admin = Admin::factory()->create();
    $project = createProjectFor($admin, 'site');
    $user = User::factory()->create(['project_id' => $project->id]);
    $token = $user->createToken('web')->plainTextToken;

    $this->postJson('/internal/introspect', ['token' => $token], serviceHeaders())
        ->assertOk()
        ->assertJsonPath('subject', 'project_user')
        ->assertJsonPath('project_id', $project->id);

    app(BlockUserHandler::class)->handle(new BlockUserCommand($user, true));
    $token2 = $user->createToken('web2')->plainTextToken;

    $this->postJson('/internal/introspect', ['token' => $token2], serviceHeaders())
        ->assertOk()
        ->assertJsonPath('active', false);
});

test('introspection resolves api keys and enabled services', function () {
    $admin = Admin::factory()->create();
    $project = createProjectFor($admin, 'keys2');
    app(ToggleServiceHandler::class)->handle(new ToggleServiceCommand($project, 'content', true));
    $issued = ProjectApiKey::issue($project->id, 'public', ['collect']);

    $this->postJson('/internal/introspect', ['api_key' => $issued['plain']], serviceHeaders())
        ->assertOk()
        ->assertJsonPath('subject', 'api_key')
        ->assertJsonPath('key_type', 'public')
        ->assertJsonPath('scopes.0', 'collect')
        ->assertJson(fn ($json) => $json->where('enabled_services', fn ($s) => collect($s)->contains('content'))->etc());

    $issued['model']->forceFill(['revoked_at' => now()])->save();

    $this->postJson('/internal/introspect', ['api_key' => $issued['plain']], serviceHeaders())
        ->assertOk()
        ->assertJsonPath('active', false);
});

test('bootstrap returns full console manifest in one request', function () {
    $this->postJson('/internal/manifests', [
        'key' => 'content', 'version' => '1.0.0',
        'permissions' => [['key' => 'content.posts.view', 'label' => 'View', 'group' => 'posts']],
        'navigation' => [['key' => 'content.posts', 'label' => 'nav.posts', 'route' => '/content/posts', 'permission' => 'content.posts.view']],
    ], serviceHeaders())->assertOk();

    $admin = Admin::factory()->create();
    $project = createProjectFor($admin, 'boot');
    app(ToggleServiceHandler::class)->handle(new ToggleServiceCommand($project, 'content', true));

    $boot = $this->getJson('/api/admin/v1/bootstrap?project=boot', adminHeaders($admin))->assertOk();

    expect($boot->json('data.user.email'))->toBe($admin->email)
        ->and($boot->json('data.current_project'))->toBe('boot')
        ->and(collect($boot->json('data.services'))->pluck('key'))->toContain('content')
        ->and($boot->json('data.permissions'))->toContain('content.posts.view')
        ->and($boot->json('data.server_time'))->not->toBeNull();
});

test('bootstrap navigation is filtered by permissions', function () {
    $this->postJson('/internal/manifests', [
        'key' => 'content', 'version' => '1.0.0',
        'permissions' => [
            ['key' => 'content.posts.view', 'label' => 'View', 'group' => 'posts'],
            ['key' => 'content.posts.manage', 'label' => 'Manage', 'group' => 'posts'],
        ],
        'navigation' => [
            ['key' => 'content.posts', 'label' => 'nav.posts', 'route' => '/posts', 'permission' => 'content.posts.view'],
            ['key' => 'content.manage', 'label' => 'nav.manage', 'route' => '/manage', 'permission' => 'content.posts.manage'],
        ],
    ], serviceHeaders())->assertOk();

    $owner = Admin::factory()->create();
    $project = createProjectFor($owner, 'nav');
    app(ToggleServiceHandler::class)->handle(new ToggleServiceCommand($project, 'content', true));

    $analyst = Admin::factory()->create();
    $project->members()->attach($analyst->id);
    $r = app(PermissionRegistrar::class);
    $r->setPermissionsTeamId($project->id);
    $analyst->assignRole('viewer'); // только *.view
    $r->setPermissionsTeamId(null);

    $boot = $this->getJson('/api/admin/v1/bootstrap?project=nav', adminHeaders($analyst))->assertOk();
    $nav = collect($boot->json('data.services'))->firstWhere('key', 'content')['navigation'];

    expect(collect($nav)->pluck('key'))->toContain('content.posts')->not->toContain('content.manage');
});

test('translations version notification is reflected in bootstrap', function () {
    $admin = Admin::factory()->create();
    PermissionSyncer::grantSuperAdmin($admin);
    $project = createProjectFor($admin, 'trv-proj');

    $bootstrap = fn () => $this->getJson('/api/admin/v1/bootstrap?project=trv-proj', adminHeaders($admin))
        ->assertOk()->json('data.translations_version');

    expect($bootstrap())->toBe('1');

    $this->postJson('/internal/translations-version', [
        'project_id' => $project->id,
        'version' => 7,
    ], serviceHeaders())->assertStatus(202);

    expect($bootstrap())->toBe('7');
});

test('translations version endpoint requires the service token', function () {
    $this->postJson('/internal/translations-version', ['project_id' => 'x', 'version' => 2])
        ->assertStatus(401);
});
