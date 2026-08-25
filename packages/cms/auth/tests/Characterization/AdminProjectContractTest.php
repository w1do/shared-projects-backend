<?php

declare(strict_types=1);

use Cms\Auth\Domain\Models\Admin;
use Cms\Auth\Domain\Models\Project;
use Cms\Shared\Testing\ResponseSnapshot;
use Spatie\Permission\PermissionRegistrar;

/** Характеризационные снимки контракта изменения и архивации проекта. */
beforeEach(function () {
    syncAuthManifest();
});

/** Участник проекта только с правами *.view — источник 403-веток. */
function projectContractViewer(Project $project, string $email): Admin
{
    $viewer = Admin::factory()->create(['email' => $email, 'name' => 'Viewer']);
    $project->members()->attach($viewer->id);

    $registrar = app(PermissionRegistrar::class);
    $registrar->setPermissionsTeamId($project->id);
    $viewer->assignRole('viewer');
    $registrar->setPermissionsTeamId(null);

    return $viewer;
}

test('contract: project update', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    $project = createProjectFor($admin, 'site-a');

    $response = $this->patchJson("/api/admin/v1/projects/{$project->key}", [
        'name' => 'Renamed Site',
        'locales' => ['ru', 'en'],
    ], adminHeaders($admin));

    ResponseSnapshot::assertMatches($response, 'projects-update');
});

test('contract: project update validation error', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    $project = createProjectFor($admin, 'site-a');

    $response = $this->patchJson("/api/admin/v1/projects/{$project->key}", [
        'name' => str_repeat('n', 256),
        'locales' => [],
    ], adminHeaders($admin));

    ResponseSnapshot::assertMatches($response, 'projects-update-422');
});

test('contract: project update forbidden', function () {
    $owner = Admin::factory()->create(['email' => 'owner@example.com', 'name' => 'Owner']);
    $project = createProjectFor($owner, 'site-a');
    $viewer = projectContractViewer($project, 'viewer@example.com');

    $response = $this->patchJson("/api/admin/v1/projects/{$project->key}", [
        'name' => 'Renamed Site',
    ], adminHeaders($viewer));

    ResponseSnapshot::assertMatches($response, 'projects-update-403');
});

test('contract: project update unauthenticated', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    $project = createProjectFor($admin, 'site-a');

    $response = $this->patchJson("/api/admin/v1/projects/{$project->key}", ['name' => 'Renamed Site']);

    ResponseSnapshot::assertMatches($response, 'projects-update-401');
});

test('contract: project archive', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    $project = createProjectFor($admin, 'site-a');

    $response = $this->postJson("/api/admin/v1/projects/{$project->key}/archive", [], adminHeaders($admin));

    ResponseSnapshot::assertMatches($response, 'projects-archive');
});

test('contract: project archive forbidden', function () {
    $owner = Admin::factory()->create(['email' => 'owner@example.com', 'name' => 'Owner']);
    $project = createProjectFor($owner, 'site-a');
    $viewer = projectContractViewer($project, 'viewer@example.com');

    $response = $this->postJson("/api/admin/v1/projects/{$project->key}/archive", [], adminHeaders($viewer));

    ResponseSnapshot::assertMatches($response, 'projects-archive-403');
});

test('contract: project archive of unknown project', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    createProjectFor($admin, 'site-a');

    $response = $this->postJson('/api/admin/v1/projects/ghost/archive', [], adminHeaders($admin));

    ResponseSnapshot::assertMatches($response, 'projects-archive-404');
});

test('contract: project show forbidden', function () {
    $owner = Admin::factory()->create(['email' => 'owner@example.com', 'name' => 'Owner']);
    $project = createProjectFor($owner, 'site-a');

    $stranger = Admin::factory()->create(['email' => 'stranger@example.com', 'name' => 'Stranger']);
    $project->members()->attach($stranger->id);

    $response = $this->getJson("/api/admin/v1/projects/{$project->key}", adminHeaders($stranger));

    ResponseSnapshot::assertMatches($response, 'projects-show-403');
});
