<?php

declare(strict_types=1);

use Cms\Auth\Domain\Models\Admin;
use Cms\Auth\Domain\Models\Project;
use Cms\Auth\Domain\Models\User;
use Cms\Shared\Testing\ResponseSnapshot;
use Spatie\Permission\PermissionRegistrar;

/** Характеризационные снимки контракта пользователей сайта в админке. */
beforeEach(function () {
    syncAuthManifest();
});

/** Участник проекта только с правами *.view — источник 403-веток. */
function projectUserContractViewer(Project $project, string $email): Admin
{
    $viewer = Admin::factory()->create(['email' => $email, 'name' => 'Viewer']);
    $project->members()->attach($viewer->id);

    $registrar = app(PermissionRegistrar::class);
    $registrar->setPermissionsTeamId($project->id);
    $viewer->assignRole('viewer');
    $registrar->setPermissionsTeamId(null);

    return $viewer;
}

test('contract: project users index empty', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    $project = createProjectFor($admin, 'site-a');

    $response = $this->getJson("/api/admin/v1/projects/{$project->key}/users", adminHeaders($admin));

    ResponseSnapshot::assertMatches($response, 'users-index-empty');
});

test('contract: project users index', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    $project = createProjectFor($admin, 'site-a');

    User::factory()->create(['project_id' => $project->id, 'email' => 'first@example.com', 'name' => 'First User']);
    User::factory()->create(['project_id' => $project->id, 'email' => 'second@example.com', 'name' => 'Second User']);

    $response = $this->getJson("/api/admin/v1/projects/{$project->key}/users", adminHeaders($admin));

    ResponseSnapshot::assertMatches($response, 'users-index');
});

test('contract: project user block and unblock', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    $project = createProjectFor($admin, 'site-a');
    $user = User::factory()->create([
        'project_id' => $project->id,
        'email' => 'first@example.com',
        'name' => 'First User',
    ]);
    $headers = adminHeaders($admin);

    ResponseSnapshot::assertMatches(
        $this->postJson("/api/admin/v1/projects/{$project->key}/users/{$user->id}/block", [], $headers),
        'users-block',
    );

    ResponseSnapshot::assertMatches(
        $this->postJson("/api/admin/v1/projects/{$project->key}/users/{$user->id}/unblock", [], $headers),
        'users-unblock',
    );
});

test('contract: project user delete', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    $project = createProjectFor($admin, 'site-a');
    $user = User::factory()->create([
        'project_id' => $project->id,
        'email' => 'first@example.com',
        'name' => 'First User',
    ]);

    $response = $this->deleteJson(
        "/api/admin/v1/projects/{$project->key}/users/{$user->id}",
        [],
        adminHeaders($admin),
    );

    ResponseSnapshot::assertMatches($response, 'users-destroy');
});

test('contract: project user actions for unknown user', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    $project = createProjectFor($admin, 'site-a');
    $headers = adminHeaders($admin);

    ResponseSnapshot::assertMatches(
        $this->postJson("/api/admin/v1/projects/{$project->key}/users/999999/block", [], $headers),
        'users-block-404',
    );

    ResponseSnapshot::assertMatches(
        $this->postJson("/api/admin/v1/projects/{$project->key}/users/999999/unblock", [], $headers),
        'users-unblock-404',
    );

    ResponseSnapshot::assertMatches(
        $this->deleteJson("/api/admin/v1/projects/{$project->key}/users/999999", [], $headers),
        'users-destroy-404',
    );
});

test('contract: project user management forbidden', function () {
    $owner = Admin::factory()->create(['email' => 'owner@example.com', 'name' => 'Owner']);
    $project = createProjectFor($owner, 'site-a');
    $viewer = projectUserContractViewer($project, 'viewer@example.com');
    $user = User::factory()->create([
        'project_id' => $project->id,
        'email' => 'first@example.com',
        'name' => 'First User',
    ]);

    ResponseSnapshot::assertMatches(
        $this->postJson(
            "/api/admin/v1/projects/{$project->key}/users/{$user->id}/block",
            [],
            adminHeaders($viewer),
        ),
        'users-block-403',
    );

    ResponseSnapshot::assertMatches(
        $this->deleteJson(
            "/api/admin/v1/projects/{$project->key}/users/{$user->id}",
            [],
            adminHeaders($viewer),
        ),
        'users-destroy-403',
    );
});

test('contract: project users index unauthenticated', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    $project = createProjectFor($admin, 'site-a');

    $response = $this->getJson("/api/admin/v1/projects/{$project->key}/users");

    ResponseSnapshot::assertMatches($response, 'users-index-401');
});
