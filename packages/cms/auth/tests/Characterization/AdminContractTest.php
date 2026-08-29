<?php

declare(strict_types=1);

use Cms\Auth\Domain\Models\Admin;
use Cms\Shared\Testing\ResponseSnapshot;
use Spatie\Permission\PermissionRegistrar;

/**
 * Характеризационные снимки admin-контракта auth.
 * Фиксируют текущий формат ответов до рефакторинга: любые изменения
 * конверта, ключей, типов и кодов ошибок делают тест красным.
 */
beforeEach(function () {
    syncAuthManifest();
});

test('contract: admin login success', function () {
    Admin::factory()->create(['email' => 'op@example.com', 'password' => 'secret-123', 'name' => 'Operator']);

    $response = $this->postJson('/api/admin/v1/auth/login', [
        'email' => 'op@example.com',
        'password' => 'secret-123',
    ]);

    ResponseSnapshot::assertMatches($response, 'admin-login-success');
});

test('contract: admin login validation error', function () {
    $response = $this->postJson('/api/admin/v1/auth/login', ['email' => 'not-an-email']);

    ResponseSnapshot::assertMatches($response, 'admin-login-422');
});

test('contract: admin login wrong password', function () {
    Admin::factory()->create(['email' => 'op@example.com', 'password' => 'secret-123']);

    $response = $this->postJson('/api/admin/v1/auth/login', [
        'email' => 'op@example.com',
        'password' => 'wrong-password',
    ]);

    ResponseSnapshot::assertMatches($response, 'admin-login-wrong-password');
});

test('contract: unauthenticated admin request', function () {
    $response = $this->getJson('/api/admin/v1/me');

    ResponseSnapshot::assertMatches($response, 'admin-me-401');
});

test('contract: admin me', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator', 'locale' => 'ru']);

    $response = $this->getJson('/api/admin/v1/me', adminHeaders($admin));

    ResponseSnapshot::assertMatches($response, 'admin-me');
});

test('contract: admin bootstrap', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    createProjectFor($admin, 'site-a');

    $response = $this->getJson('/api/admin/v1/bootstrap', adminHeaders($admin));

    ResponseSnapshot::assertMatches($response, 'admin-bootstrap');
});

test('contract: projects index and show', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    $project = createProjectFor($admin, 'site-a');
    $headers = adminHeaders($admin);

    ResponseSnapshot::assertMatches($this->getJson('/api/admin/v1/projects', $headers), 'projects-index');
    ResponseSnapshot::assertMatches(
        $this->getJson("/api/admin/v1/projects/{$project->key}", $headers),
        'projects-show',
    );
});

test('contract: project create', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    createProjectFor($admin, 'site-a');

    $response = $this->postJson('/api/admin/v1/projects', [
        'key' => 'site-b',
        'name' => 'Site B',
    ], adminHeaders($admin));

    ResponseSnapshot::assertMatches($response, 'projects-create');
});

test('contract: project create from the name alone', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    createProjectFor($admin, 'site-a');

    $response = $this->postJson('/api/admin/v1/projects', [
        'name' => 'Site B',
    ], adminHeaders($admin));

    ResponseSnapshot::assertMatches($response, 'projects-create-derived-key');
});

test('contract: project create validation error', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    createProjectFor($admin, 'site-a');

    $response = $this->postJson('/api/admin/v1/projects', [
        'key' => 'site-a',
        'name' => '',
    ], adminHeaders($admin));

    ResponseSnapshot::assertMatches($response, 'projects-create-422');
});

test('contract: project not found', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    createProjectFor($admin, 'site-a');

    $response = $this->getJson('/api/admin/v1/projects/ghost/members', adminHeaders($admin));

    ResponseSnapshot::assertMatches($response, 'projects-not-found');
});

test('contract: members index and create', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    $project = createProjectFor($admin, 'site-a');
    $headers = adminHeaders($admin);

    ResponseSnapshot::assertMatches(
        $this->getJson("/api/admin/v1/projects/{$project->key}/members", $headers),
        'members-index',
    );

    ResponseSnapshot::assertMatches(
        $this->postJson("/api/admin/v1/projects/{$project->key}/members", [
            'email' => 'newcomer@example.com',
            'name' => 'Newcomer',
            'role' => 'editor',
        ], $headers),
        'members-create',
    );
});

test('contract: roles index create and delete', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    $project = createProjectFor($admin, 'site-a');
    $headers = adminHeaders($admin);

    ResponseSnapshot::assertMatches(
        $this->getJson("/api/admin/v1/projects/{$project->key}/roles", $headers),
        'roles-index',
    );

    $created = $this->postJson("/api/admin/v1/projects/{$project->key}/roles", [
        'name' => 'moderator',
        'permissions' => ['auth.users.view'],
    ], $headers);

    ResponseSnapshot::assertMatches($created, 'roles-create');

    $roleId = $created->json('data.id');

    ResponseSnapshot::assertMatches(
        $this->deleteJson("/api/admin/v1/projects/{$project->key}/roles/{$roleId}", [], $headers),
        'roles-delete',
    );
});

test('contract: forbidden without permission', function () {
    $owner = Admin::factory()->create(['email' => 'owner@example.com', 'name' => 'Owner']);
    $project = createProjectFor($owner, 'site-a');

    $viewer = Admin::factory()->create(['email' => 'viewer@example.com', 'name' => 'Viewer']);
    $project->members()->attach($viewer->id);
    app(PermissionRegistrar::class)->setPermissionsTeamId($project->id);
    $viewer->assignRole('viewer');
    app(PermissionRegistrar::class)->setPermissionsTeamId(null);

    $response = $this->postJson("/api/admin/v1/projects/{$project->key}/members", [
        'email' => $owner->email,
        'role' => 'viewer',
    ], adminHeaders($viewer));

    ResponseSnapshot::assertMatches($response, 'members-create-403');
});
