<?php

declare(strict_types=1);

use Cms\Auth\Domain\Models\Admin;
use Cms\Auth\Domain\Models\Project;
use Cms\Auth\Domain\Models\ProjectApiKey;
use Cms\Shared\Testing\ResponseSnapshot;
use Illuminate\Support\Str;
use Spatie\Permission\PermissionRegistrar;

/**
 * Характеризационные снимки контракта API-ключей проекта.
 *
 * Ключ и его префикс строятся из Str::random — генератор подменяется
 * детерминированной последовательностью, чтобы фиксировать не только форму,
 * но и сам формат ключа (`pk_live_` / `sk_live_`).
 */
beforeEach(function () {
    syncAuthManifest();

    $sequence = 0;
    Str::createRandomStringsUsing(function (int $length) use (&$sequence): string {
        $sequence++;

        return substr('r'.$sequence.str_repeat('abcdefghijklmnopqrstuvwxyz0123456789', 4), 0, $length);
    });
});

afterEach(function () {
    Str::createRandomStringsNormally();
});

/** Участник проекта только с правами *.view — источник 403-веток. */
function apiKeyContractViewer(Project $project, string $email): Admin
{
    $viewer = Admin::factory()->create(['email' => $email, 'name' => 'Viewer']);
    $project->members()->attach($viewer->id);

    $registrar = app(PermissionRegistrar::class);
    $registrar->setPermissionsTeamId($project->id);
    $viewer->assignRole('viewer');
    $registrar->setPermissionsTeamId(null);

    return $viewer;
}

test('contract: api keys index empty', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    $project = createProjectFor($admin, 'site-a');

    $response = $this->getJson("/api/admin/v1/projects/{$project->key}/api-keys", adminHeaders($admin));

    ResponseSnapshot::assertMatches($response, 'api-keys-index-empty');
});

test('contract: api keys index', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    $project = createProjectFor($admin, 'site-a');

    $public = ProjectApiKey::issue($project->id, 'public', ['collect']);
    $secret = ProjectApiKey::issue($project->id, 'secret', ['*']);

    // Порядок выдачи (orderBy created_at) фиксируем явно
    $public['model']->forceFill(['created_at' => now()->subMinutes(2)])->saveQuietly();
    $secret['model']->forceFill(['created_at' => now()->subMinute(), 'revoked_at' => now()])->saveQuietly();

    $response = $this->getJson("/api/admin/v1/projects/{$project->key}/api-keys", adminHeaders($admin));

    ResponseSnapshot::assertMatches($response, 'api-keys-index');
});

test('contract: api key issue public', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    $project = createProjectFor($admin, 'site-a');

    $response = $this->postJson("/api/admin/v1/projects/{$project->key}/api-keys", [
        'type' => 'public',
    ], adminHeaders($admin));

    ResponseSnapshot::assertMatches($response, 'api-keys-create-public');
});

test('contract: api key issue secret with scopes', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    $project = createProjectFor($admin, 'site-a');

    $response = $this->postJson("/api/admin/v1/projects/{$project->key}/api-keys", [
        'type' => 'secret',
        'scopes' => ['collect', 'read'],
    ], adminHeaders($admin));

    ResponseSnapshot::assertMatches($response, 'api-keys-create-secret');
});

test('contract: api key issue validation error', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    $project = createProjectFor($admin, 'site-a');

    $response = $this->postJson("/api/admin/v1/projects/{$project->key}/api-keys", [
        'type' => 'internal',
        'scopes' => 'collect',
    ], adminHeaders($admin));

    ResponseSnapshot::assertMatches($response, 'api-keys-create-422');
});

test('contract: api key revoke', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    $project = createProjectFor($admin, 'site-a');
    $issued = ProjectApiKey::issue($project->id, 'public', ['collect']);

    $response = $this->deleteJson(
        "/api/admin/v1/projects/{$project->key}/api-keys/{$issued['model']->id}",
        [],
        adminHeaders($admin),
    );

    ResponseSnapshot::assertMatches($response, 'api-keys-destroy');
});

test('contract: api key revoke for unknown key', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    $project = createProjectFor($admin, 'site-a');

    $response = $this->deleteJson(
        "/api/admin/v1/projects/{$project->key}/api-keys/nonexistent-key",
        [],
        adminHeaders($admin),
    );

    ResponseSnapshot::assertMatches($response, 'api-keys-destroy-404');
});

test('contract: api keys index forbidden', function () {
    $owner = Admin::factory()->create(['email' => 'owner@example.com', 'name' => 'Owner']);
    $project = createProjectFor($owner, 'site-a');
    $viewer = apiKeyContractViewer($project, 'viewer@example.com');

    // viewer имеет auth.keys.view, но не auth.keys.manage
    $index = $this->getJson("/api/admin/v1/projects/{$project->key}/api-keys", adminHeaders($viewer));
    ResponseSnapshot::assertMatches($index, 'api-keys-index-viewer');

    $create = $this->postJson("/api/admin/v1/projects/{$project->key}/api-keys", [
        'type' => 'public',
    ], adminHeaders($viewer));
    ResponseSnapshot::assertMatches($create, 'api-keys-create-403');
});

test('contract: api keys index unauthenticated', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    $project = createProjectFor($admin, 'site-a');

    $response = $this->getJson("/api/admin/v1/projects/{$project->key}/api-keys");

    ResponseSnapshot::assertMatches($response, 'api-keys-index-401');
});
