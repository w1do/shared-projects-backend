<?php

declare(strict_types=1);

use Cms\Auth\Domain\Models\Admin;
use Cms\Auth\Domain\Models\Project;
use Cms\Shared\Testing\ResponseSnapshot;
use Spatie\Permission\PermissionRegistrar;

/** Характеризационные снимки контракта участников проекта: смена роли и исключение. */
beforeEach(function () {
    syncAuthManifest();
});

/** Участник проекта с заданной ролью. */
function memberContractMember(Project $project, string $email, string $name, ?string $role = null): Admin
{
    $member = Admin::factory()->create(['email' => $email, 'name' => $name]);
    $project->members()->attach($member->id);

    if ($role !== null) {
        $registrar = app(PermissionRegistrar::class);
        $registrar->setPermissionsTeamId($project->id);
        $member->assignRole($role);
        $registrar->setPermissionsTeamId(null);
    }

    return $member;
}

test('contract: member role assignment', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    $project = createProjectFor($admin, 'site-a');
    $member = memberContractMember($project, 'member@example.com', 'Member', 'viewer');

    $response = $this->putJson(
        "/api/admin/v1/projects/{$project->key}/members/{$member->id}/role",
        ['role' => 'editor'],
        adminHeaders($admin),
    );

    ResponseSnapshot::assertMatches($response, 'members-assign-role');
});

test('contract: member role assignment with unknown role', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    $project = createProjectFor($admin, 'site-a');
    $member = memberContractMember($project, 'member@example.com', 'Member', 'viewer');

    $response = $this->putJson(
        "/api/admin/v1/projects/{$project->key}/members/{$member->id}/role",
        ['role' => 'manager'],
        adminHeaders($admin),
    );

    ResponseSnapshot::assertMatches($response, 'members-assign-role-422');
});

test('contract: member role assignment validation error', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    $project = createProjectFor($admin, 'site-a');
    $member = memberContractMember($project, 'member@example.com', 'Member', 'viewer');

    $response = $this->putJson(
        "/api/admin/v1/projects/{$project->key}/members/{$member->id}/role",
        [],
        adminHeaders($admin),
    );

    ResponseSnapshot::assertMatches($response, 'members-assign-role-missing-role-422');
});

test('contract: member role assignment for unknown member', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    $project = createProjectFor($admin, 'site-a');

    $response = $this->putJson(
        "/api/admin/v1/projects/{$project->key}/members/999999/role",
        ['role' => 'editor'],
        adminHeaders($admin),
    );

    ResponseSnapshot::assertMatches($response, 'members-assign-role-404');
});

test('contract: member role assignment forbidden', function () {
    $owner = Admin::factory()->create(['email' => 'owner@example.com', 'name' => 'Owner']);
    $project = createProjectFor($owner, 'site-a');
    $viewer = memberContractMember($project, 'viewer@example.com', 'Viewer', 'viewer');

    $response = $this->putJson(
        "/api/admin/v1/projects/{$project->key}/members/{$viewer->id}/role",
        ['role' => 'editor'],
        adminHeaders($viewer),
    );

    ResponseSnapshot::assertMatches($response, 'members-assign-role-403');
});

test('contract: member removal', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    $project = createProjectFor($admin, 'site-a');
    $member = memberContractMember($project, 'member@example.com', 'Member', 'viewer');

    $response = $this->deleteJson(
        "/api/admin/v1/projects/{$project->key}/members/{$member->id}",
        [],
        adminHeaders($admin),
    );

    ResponseSnapshot::assertMatches($response, 'members-destroy');
});

test('contract: member removal for unknown member', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    $project = createProjectFor($admin, 'site-a');

    $response = $this->deleteJson(
        "/api/admin/v1/projects/{$project->key}/members/999999",
        [],
        adminHeaders($admin),
    );

    ResponseSnapshot::assertMatches($response, 'members-destroy-404');
});

test('contract: member removal forbidden', function () {
    $owner = Admin::factory()->create(['email' => 'owner@example.com', 'name' => 'Owner']);
    $project = createProjectFor($owner, 'site-a');
    $viewer = memberContractMember($project, 'viewer@example.com', 'Viewer', 'viewer');

    $response = $this->deleteJson(
        "/api/admin/v1/projects/{$project->key}/members/{$owner->id}",
        [],
        adminHeaders($viewer),
    );

    ResponseSnapshot::assertMatches($response, 'members-destroy-403');
});

test('contract: members index unauthenticated', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    $project = createProjectFor($admin, 'site-a');

    $response = $this->getJson("/api/admin/v1/projects/{$project->key}/members");

    ResponseSnapshot::assertMatches($response, 'members-index-401');
});
