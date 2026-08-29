<?php

declare(strict_types=1);

use Cms\Auth\Application\Commands\BlockUserCommand;
use Cms\Auth\Application\Commands\ToggleServiceCommand;
use Cms\Auth\Application\Handlers\BlockUserHandler;
use Cms\Auth\Application\Handlers\ToggleServiceHandler;
use Cms\Auth\Domain\Models\Admin;
use Cms\Auth\Domain\Models\Project;
use Cms\Auth\Domain\Models\ProjectApiKey;
use Cms\Auth\Domain\Models\User;
use Cms\Auth\Infrastructure\Persistence\PermissionSyncer;
use Cms\Shared\Testing\ResponseSnapshot;

/**
 * Характеризационные снимки internal-контракта: introspection токенов и ключей,
 * регистрация манифестов, уведомление о версии переводов.
 */
beforeEach(function () {
    config(['cms.service_token' => 'test-service-token']);
    syncAuthManifest();
});

function internalContractServiceHeaders(): array
{
    return ['Authorization' => 'Service test-service-token'];
}

test('contract: internal introspect admin token with project', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    createProjectFor($admin, 'site-a');
    $token = $admin->createToken('admin')->plainTextToken;

    $response = $this->postJson('/internal/introspect', [
        'token' => $token,
        'project' => 'site-a',
    ], internalContractServiceHeaders());

    ResponseSnapshot::assertMatches($response, 'internal-introspect-admin');
});

test('contract: internal introspect admin token without project', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    createProjectFor($admin, 'site-a');
    $token = $admin->createToken('admin')->plainTextToken;

    $response = $this->postJson('/internal/introspect', [
        'token' => $token,
    ], internalContractServiceHeaders());

    ResponseSnapshot::assertMatches($response, 'internal-introspect-admin-no-project');
});

test('contract: internal introspect admin token for foreign project', function () {
    $owner = Admin::factory()->create(['email' => 'owner@example.com', 'name' => 'Owner']);
    createProjectFor($owner, 'site-a');

    $stranger = Admin::factory()->create(['email' => 'stranger@example.com', 'name' => 'Stranger']);
    $token = $stranger->createToken('admin')->plainTextToken;

    $response = $this->postJson('/internal/introspect', [
        'token' => $token,
        'project' => 'site-a',
    ], internalContractServiceHeaders());

    ResponseSnapshot::assertMatches($response, 'internal-introspect-admin-foreign-project');
});

test('contract: internal introspect super admin token', function () {
    $owner = Admin::factory()->create(['email' => 'owner@example.com', 'name' => 'Owner']);
    createProjectFor($owner, 'site-a');

    $root = Admin::factory()->create(['email' => 'root@example.com', 'name' => 'Root']);
    PermissionSyncer::grantSuperAdmin($root);
    $token = $root->createToken('admin')->plainTextToken;

    $response = $this->postJson('/internal/introspect', [
        'token' => $token,
        'project' => 'site-a',
    ], internalContractServiceHeaders());

    ResponseSnapshot::assertMatches($response, 'internal-introspect-super-admin');
});

test('contract: internal introspect site user token', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    $project = createProjectFor($admin, 'site-a');
    app(ToggleServiceHandler::class)->handle(new ToggleServiceCommand($project, 'content', true));

    $user = User::factory()->create([
        'project_id' => $project->id,
        'email' => 'u@example.com',
        'name' => 'Site User',
    ]);
    $token = $user->createToken('web')->plainTextToken;

    $response = $this->postJson('/internal/introspect', [
        'token' => $token,
    ], internalContractServiceHeaders());

    ResponseSnapshot::assertMatches($response, 'internal-introspect-site-user');
});

test('contract: internal introspect blocked site user token', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    $project = createProjectFor($admin, 'site-a');

    $user = User::factory()->create([
        'project_id' => $project->id,
        'email' => 'u@example.com',
        'name' => 'Site User',
    ]);
    app(BlockUserHandler::class)->handle(new BlockUserCommand($user, true));
    $token = $user->createToken('web')->plainTextToken;

    $response = $this->postJson('/internal/introspect', [
        'token' => $token,
    ], internalContractServiceHeaders());

    ResponseSnapshot::assertMatches($response, 'internal-introspect-blocked-user');
});

test('contract: internal introspect api key', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    $project = createProjectFor($admin, 'site-a');
    app(ToggleServiceHandler::class)->handle(new ToggleServiceCommand($project, 'content', true));
    $issued = ProjectApiKey::issue($project->id, 'public', ['collect']);

    $response = $this->postJson('/internal/introspect', [
        'api_key' => $issued['plain'],
    ], internalContractServiceHeaders());

    ResponseSnapshot::assertMatches($response, 'internal-introspect-api-key');
});

test('contract: internal introspect revoked api key', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    $project = createProjectFor($admin, 'site-a');
    $issued = ProjectApiKey::issue($project->id, 'public', ['collect']);
    $issued['model']->forceFill(['revoked_at' => now()])->save();

    $response = $this->postJson('/internal/introspect', [
        'api_key' => $issued['plain'],
    ], internalContractServiceHeaders());

    ResponseSnapshot::assertMatches($response, 'internal-introspect-revoked-api-key');
});

test('contract: internal introspect invalid token', function () {
    $response = $this->postJson('/internal/introspect', [
        'token' => 'not-a-real-token',
    ], internalContractServiceHeaders());

    ResponseSnapshot::assertMatches($response, 'internal-introspect-invalid-token');
});

test('contract: internal introspect validation error', function () {
    $response = $this->postJson('/internal/introspect', [], internalContractServiceHeaders());

    ResponseSnapshot::assertMatches($response, 'internal-introspect-422');
    // Снимок маскирует значения ключа token — текст сообщения фиксируем явно.
    $response->assertJsonPath('error.details.token.0', 'The token field is required when api key is not present.');
});

test('contract: internal introspect without service token', function () {
    $response = $this->postJson('/internal/introspect', ['token' => 'x']);

    ResponseSnapshot::assertMatches($response, 'internal-introspect-401');
});

test('contract: internal manifest publish', function () {
    $response = $this->postJson('/internal/manifests', [
        'key' => 'content',
        'version' => '1.2.3',
        'permissions' => [
            ['key' => 'content.posts.view', 'label' => 'View posts', 'group' => 'posts'],
        ],
        'navigation' => [
            ['key' => 'content.posts', 'label' => 'nav.posts', 'route' => '/content/posts', 'permission' => 'content.posts.view'],
        ],
        'settings' => [
            ['key' => 'site_title', 'type' => 'string', 'label' => 'Site title'],
        ],
    ], internalContractServiceHeaders());

    ResponseSnapshot::assertMatches($response, 'internal-manifest-store');
});

test('contract: internal manifest publish validation error', function () {
    $response = $this->postJson('/internal/manifests', [
        'key' => 'not a slug!',
    ], internalContractServiceHeaders());

    ResponseSnapshot::assertMatches($response, 'internal-manifest-store-422');
});

test('contract: internal manifest publish without service token', function () {
    $response = $this->postJson('/internal/manifests', ['key' => 'content', 'version' => '1.0.0']);

    ResponseSnapshot::assertMatches($response, 'internal-manifest-store-401');
});

test('contract: internal translations version', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    $project = createProjectFor($admin, 'site-a');

    $response = $this->postJson('/internal/translations-version', [
        'project_id' => $project->id,
        'version' => 7,
    ], internalContractServiceHeaders());

    ResponseSnapshot::assertMatches($response, 'internal-translations-version');
});

test('contract: internal translations version validation error', function () {
    $response = $this->postJson('/internal/translations-version', [
        'version' => 0,
    ], internalContractServiceHeaders());

    ResponseSnapshot::assertMatches($response, 'internal-translations-version-422');
    // Снимок маскирует значения ключа project_id — текст сообщения фиксируем явно.
    $response->assertJsonPath('error.details.project_id.0', 'The project id field is required.');
});

test('contract: internal translations version without service token', function () {
    $response = $this->postJson('/internal/translations-version', ['project_id' => 'x', 'version' => 2]);

    ResponseSnapshot::assertMatches($response, 'internal-translations-version-401');
});

test('contract: internal project profile fills description and topic', function () {
    $project = Project::factory()->create(['key' => 'site-a', 'name' => 'SITE-A']);

    $response = $this->postJson('/internal/project-profile', [
        'project_id' => $project->id,
        'description' => 'Автомобильный портал',
        'topic' => 'автомобили',
    ], internalContractServiceHeaders());

    ResponseSnapshot::assertMatches($response, 'internal-project-profile');

    expect($project->fresh()->description)->toBe('Автомобильный портал')
        ->and($project->fresh()->topic)->toBe('автомобили');
});

test('contract: internal project profile keeps a filled description without overwrite', function () {
    $project = Project::factory()->create([
        'key' => 'site-a', 'name' => 'SITE-A', 'description' => 'Прежнее описание',
    ]);

    $this->postJson('/internal/project-profile', [
        'project_id' => $project->id,
        'description' => 'Новое описание',
    ], internalContractServiceHeaders())->assertAccepted();

    expect($project->fresh()->description)->toBe('Прежнее описание');

    $this->postJson('/internal/project-profile', [
        'project_id' => $project->id,
        'description' => 'Новое описание',
        'overwrite' => true,
    ], internalContractServiceHeaders())->assertAccepted();

    expect($project->fresh()->description)->toBe('Новое описание');
});

test('contract: internal project profile validation error', function () {
    $response = $this->postJson('/internal/project-profile', [], internalContractServiceHeaders());

    ResponseSnapshot::assertMatches($response, 'internal-project-profile-422');
});

test('contract: internal project profile without service token', function () {
    $response = $this->postJson('/internal/project-profile', ['project_id' => 'x']);

    ResponseSnapshot::assertMatches($response, 'internal-project-profile-401');
});
