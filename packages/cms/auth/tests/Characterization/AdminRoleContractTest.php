<?php

declare(strict_types=1);

use Cms\Auth\Domain\Models\Admin;
use Cms\Shared\Testing\ResponseSnapshot;
use Spatie\Permission\Models\Role;

/** Характеризационные снимки контракта ролей проекта: изменение прав и защита системных ролей. */
beforeEach(function () {
    syncAuthManifest();
});

test('contract: role permissions update', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    $project = createProjectFor($admin, 'site-a');
    $headers = adminHeaders($admin);

    $roleId = $this->postJson("/api/admin/v1/projects/{$project->key}/roles", [
        'name' => 'moderator',
        'permissions' => ['auth.users.view', 'auth.users.manage'],
    ], $headers)->json('data.id');

    $response = $this->putJson("/api/admin/v1/projects/{$project->key}/roles/{$roleId}", [
        'permissions' => ['auth.users.view'],
    ], $headers);

    ResponseSnapshot::assertMatches($response, 'roles-update');
});

test('contract: role permissions update validation error', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    $project = createProjectFor($admin, 'site-a');
    $headers = adminHeaders($admin);

    $roleId = $this->postJson("/api/admin/v1/projects/{$project->key}/roles", [
        'name' => 'moderator',
        'permissions' => ['auth.users.view'],
    ], $headers)->json('data.id');

    $response = $this->putJson("/api/admin/v1/projects/{$project->key}/roles/{$roleId}", [
        'permissions' => ['auth.users.view', 'auth.nonexistent.permission'],
    ], $headers);

    ResponseSnapshot::assertMatches($response, 'roles-update-422');
});

test('contract: role permissions update without permissions field', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    $project = createProjectFor($admin, 'site-a');
    $headers = adminHeaders($admin);

    $roleId = $this->postJson("/api/admin/v1/projects/{$project->key}/roles", [
        'name' => 'moderator',
        'permissions' => ['auth.users.view'],
    ], $headers)->json('data.id');

    $response = $this->putJson("/api/admin/v1/projects/{$project->key}/roles/{$roleId}", [], $headers);

    ResponseSnapshot::assertMatches($response, 'roles-update-missing-permissions-422');
});

test('contract: role permissions update for unknown role', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    $project = createProjectFor($admin, 'site-a');

    $response = $this->putJson("/api/admin/v1/projects/{$project->key}/roles/999999", [
        'permissions' => ['auth.users.view'],
    ], adminHeaders($admin));

    ResponseSnapshot::assertMatches($response, 'roles-update-404');
});

test('contract: system role cannot be updated', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    $project = createProjectFor($admin, 'site-a');

    $ownerRole = Role::query()->where('project_id', $project->id)->where('name', 'owner')->firstOrFail();

    $response = $this->putJson("/api/admin/v1/projects/{$project->key}/roles/{$ownerRole->id}", [
        'permissions' => ['auth.users.view'],
    ], adminHeaders($admin));

    ResponseSnapshot::assertMatches($response, 'roles-update-system-403');
});

test('contract: system role cannot be deleted', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    $project = createProjectFor($admin, 'site-a');

    $ownerRole = Role::query()->where('project_id', $project->id)->where('name', 'owner')->firstOrFail();

    $response = $this->deleteJson(
        "/api/admin/v1/projects/{$project->key}/roles/{$ownerRole->id}",
        [],
        adminHeaders($admin),
    );

    ResponseSnapshot::assertMatches($response, 'roles-delete-system-403');
});

test('contract: role delete for unknown role', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    $project = createProjectFor($admin, 'site-a');

    $response = $this->deleteJson(
        "/api/admin/v1/projects/{$project->key}/roles/999999",
        [],
        adminHeaders($admin),
    );

    ResponseSnapshot::assertMatches($response, 'roles-delete-404');
});

test('contract: role create validation error', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    $project = createProjectFor($admin, 'site-a');

    $response = $this->postJson("/api/admin/v1/projects/{$project->key}/roles", [
        'name' => 'not a slug!',
        'permissions' => ['auth.nonexistent.permission'],
    ], adminHeaders($admin));

    ResponseSnapshot::assertMatches($response, 'roles-create-422');
});

test('contract: roles index unauthenticated', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    $project = createProjectFor($admin, 'site-a');

    $response = $this->getJson("/api/admin/v1/projects/{$project->key}/roles");

    ResponseSnapshot::assertMatches($response, 'roles-index-401');
});
