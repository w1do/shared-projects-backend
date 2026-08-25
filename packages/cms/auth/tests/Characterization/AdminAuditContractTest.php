<?php

declare(strict_types=1);

use Cms\Auth\Domain\Models\Admin;
use Cms\Auth\Domain\Models\AuditLog;
use Cms\Auth\Domain\Models\Project;
use Cms\Shared\Testing\ResponseSnapshot;
use Spatie\Permission\PermissionRegistrar;

/**
 * Характеризационные снимки журнала аудита, включая формат курсорной
 * пагинации (meta.per_page / next_cursor / prev_cursor).
 */
beforeEach(function () {
    syncAuthManifest();
});

/** Участник проекта только с правами *.view — источник 403-веток. */
function auditContractViewer(Project $project, string $email): Admin
{
    $viewer = Admin::factory()->create(['email' => $email, 'name' => 'Viewer']);
    $project->members()->attach($viewer->id);

    $registrar = app(PermissionRegistrar::class);
    $registrar->setPermissionsTeamId($project->id);
    $viewer->assignRole('viewer');
    $registrar->setPermissionsTeamId(null);

    return $viewer;
}

/** Ровно $count записей аудита с фиксированными значениями и порядком. */
function auditContractSeed(Project $project, int $count): void
{
    AuditLog::query()->delete();

    foreach (range(1, $count) as $index) {
        AuditLog::create([
            'project_id' => $project->id,
            'actor_type' => 'admin',
            'actor_id' => '1',
            'action' => 'project.updated',
            'subject' => "project:{$project->key}",
            'changes' => ['before' => ['name' => 'SITE-A'], 'after' => ['name' => "Name {$index}"]],
            'trace_id' => 'fixed-trace',
            'created_at' => now()->subSeconds($count - $index),
        ]);
    }
}

test('contract: audit index empty', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    $project = createProjectFor($admin, 'site-a');
    AuditLog::query()->delete();

    $response = $this->getJson("/api/admin/v1/projects/{$project->key}/audit", adminHeaders($admin));

    ResponseSnapshot::assertMatches($response, 'audit-index-empty');
});

test('contract: audit index records real actions', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    $project = createProjectFor($admin, 'site-a');
    $headers = adminHeaders($admin);

    $this->patchJson("/api/admin/v1/projects/{$project->key}", ['name' => 'Renamed Site'], $headers);
    $this->postJson("/api/admin/v1/projects/{$project->key}/archive", [], $headers);

    $response = $this->getJson("/api/admin/v1/projects/{$project->key}/audit", $headers);

    ResponseSnapshot::assertMatches($response, 'audit-index');
});

test('contract: audit index first cursor page', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    $project = createProjectFor($admin, 'site-a');
    auditContractSeed($project, 51);

    $response = $this->getJson("/api/admin/v1/projects/{$project->key}/audit", adminHeaders($admin));

    ResponseSnapshot::assertMatches($response, 'audit-index-cursor-first-page');
    expect($response->json('meta.next_cursor'))->toBeString();
    expect($response->json('data'))->toHaveCount(50);
});

test('contract: audit index second cursor page', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    $project = createProjectFor($admin, 'site-a');
    auditContractSeed($project, 51);
    $headers = adminHeaders($admin);

    $cursor = $this->getJson("/api/admin/v1/projects/{$project->key}/audit", $headers)->json('meta.next_cursor');

    $response = $this->getJson("/api/admin/v1/projects/{$project->key}/audit?cursor={$cursor}", $headers);

    ResponseSnapshot::assertMatches($response, 'audit-index-cursor-second-page');
});

test('contract: audit index forbidden', function () {
    $owner = Admin::factory()->create(['email' => 'owner@example.com', 'name' => 'Owner']);
    $project = createProjectFor($owner, 'site-a');

    $stranger = Admin::factory()->create(['email' => 'stranger@example.com', 'name' => 'Stranger']);
    $project->members()->attach($stranger->id);

    $response = $this->getJson("/api/admin/v1/projects/{$project->key}/audit", adminHeaders($stranger));

    ResponseSnapshot::assertMatches($response, 'audit-index-403');
});

test('contract: audit index visible to viewer role', function () {
    $owner = Admin::factory()->create(['email' => 'owner@example.com', 'name' => 'Owner']);
    $project = createProjectFor($owner, 'site-a');
    $viewer = auditContractViewer($project, 'viewer@example.com');
    AuditLog::query()->delete();

    $response = $this->getJson("/api/admin/v1/projects/{$project->key}/audit", adminHeaders($viewer));

    ResponseSnapshot::assertMatches($response, 'audit-index-viewer');
});

test('contract: audit index unauthenticated', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    $project = createProjectFor($admin, 'site-a');

    $response = $this->getJson("/api/admin/v1/projects/{$project->key}/audit");

    ResponseSnapshot::assertMatches($response, 'audit-index-401');
});
