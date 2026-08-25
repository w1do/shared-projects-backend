<?php

declare(strict_types=1);

use Cms\Auth\Domain\Models\Admin;
use Cms\Auth\Domain\Models\Project;
use Cms\Shared\Testing\ResponseSnapshot;
use Spatie\Permission\PermissionRegistrar;

/** Характеризационные снимки контракта включения сервисов на проект. */
beforeEach(function () {
    syncAuthManifest();
});

/** Участник проекта только с правами *.view — источник 403-веток. */
function serviceContractViewer(Project $project, string $email): Admin
{
    $viewer = Admin::factory()->create(['email' => $email, 'name' => 'Viewer']);
    $project->members()->attach($viewer->id);

    $registrar = app(PermissionRegistrar::class);
    $registrar->setPermissionsTeamId($project->id);
    $viewer->assignRole('viewer');
    $registrar->setPermissionsTeamId(null);

    return $viewer;
}

test('contract: services index', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    $project = createProjectFor($admin, 'site-a');

    $response = $this->getJson("/api/admin/v1/projects/{$project->key}/services", adminHeaders($admin));

    ResponseSnapshot::assertMatches($response, 'services-index');
});

test('contract: services index with enabled service', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    $project = createProjectFor($admin, 'site-a');
    $headers = adminHeaders($admin);

    $this->putJson("/api/admin/v1/projects/{$project->key}/services/content", ['enabled' => true], $headers);

    $response = $this->getJson("/api/admin/v1/projects/{$project->key}/services", $headers);

    ResponseSnapshot::assertMatches($response, 'services-index-enabled');
});

test('contract: service enable', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    $project = createProjectFor($admin, 'site-a');

    $response = $this->putJson(
        "/api/admin/v1/projects/{$project->key}/services/content",
        ['enabled' => true],
        adminHeaders($admin),
    );

    ResponseSnapshot::assertMatches($response, 'services-update-enable');
});

test('contract: service disable', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    $project = createProjectFor($admin, 'site-a');
    $headers = adminHeaders($admin);

    $this->putJson("/api/admin/v1/projects/{$project->key}/services/content", ['enabled' => true], $headers);

    $response = $this->putJson(
        "/api/admin/v1/projects/{$project->key}/services/content",
        ['enabled' => false],
        $headers,
    );

    ResponseSnapshot::assertMatches($response, 'services-update-disable');
});

test('contract: service toggle validation error', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    $project = createProjectFor($admin, 'site-a');

    $response = $this->putJson(
        "/api/admin/v1/projects/{$project->key}/services/content",
        ['enabled' => 'maybe'],
        adminHeaders($admin),
    );

    ResponseSnapshot::assertMatches($response, 'services-update-422');
});

test('contract: service toggle forbidden', function () {
    $owner = Admin::factory()->create(['email' => 'owner@example.com', 'name' => 'Owner']);
    $project = createProjectFor($owner, 'site-a');
    $viewer = serviceContractViewer($project, 'viewer@example.com');

    $response = $this->putJson(
        "/api/admin/v1/projects/{$project->key}/services/content",
        ['enabled' => true],
        adminHeaders($viewer),
    );

    ResponseSnapshot::assertMatches($response, 'services-update-403');
});

test('contract: services index unauthenticated', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    $project = createProjectFor($admin, 'site-a');

    $response = $this->getJson("/api/admin/v1/projects/{$project->key}/services");

    ResponseSnapshot::assertMatches($response, 'services-index-401');
});
