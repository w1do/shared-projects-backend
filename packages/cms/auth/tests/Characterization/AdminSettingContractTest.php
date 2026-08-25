<?php

declare(strict_types=1);

use Cms\Auth\Application\Commands\PublishManifestCommand;
use Cms\Auth\Application\Handlers\PublishManifestHandler;
use Cms\Auth\Domain\Models\Admin;
use Cms\Auth\Domain\Models\Project;
use Cms\Contracts\Manifest\ServiceManifest;
use Cms\Contracts\Manifest\SettingDefinition;
use Cms\Shared\Testing\ResponseSnapshot;
use Spatie\Permission\PermissionRegistrar;

/**
 * Характеризационные снимки контракта настроек сервиса на проект,
 * включая маскировку секретных значений в ответе.
 */
beforeEach(function () {
    syncAuthManifest();

    // Сервис content со схемой настроек: обычное поле, число и секрет
    app(PublishManifestHandler::class)->handle(new PublishManifestCommand(new ServiceManifest(
        key: 'content',
        version: '1.0.0',
        settings: [
            new SettingDefinition('site_title', 'string', 'Site title', 'Default', ['string', 'max:255']),
            new SettingDefinition('per_page', 'integer', 'Per page', 20, ['integer', 'min:1']),
            new SettingDefinition('api_secret', 'string', 'API secret', null, ['string'], true),
        ],
    )));
});

/** Участник проекта только с правами *.view — источник 403-веток. */
function settingContractViewer(Project $project, string $email): Admin
{
    $viewer = Admin::factory()->create(['email' => $email, 'name' => 'Viewer']);
    $project->members()->attach($viewer->id);

    $registrar = app(PermissionRegistrar::class);
    $registrar->setPermissionsTeamId($project->id);
    $viewer->assignRole('viewer');
    $registrar->setPermissionsTeamId(null);

    return $viewer;
}

test('contract: settings show empty', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    $project = createProjectFor($admin, 'site-a');

    $response = $this->getJson("/api/admin/v1/projects/{$project->key}/settings/content", adminHeaders($admin));

    ResponseSnapshot::assertMatches($response, 'settings-show-empty');
});

test('contract: settings update and show with secret', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    $project = createProjectFor($admin, 'site-a');
    $headers = adminHeaders($admin);

    $updated = $this->putJson("/api/admin/v1/projects/{$project->key}/settings/content", [
        'values' => [
            'site_title' => 'My Site',
            'per_page' => 25,
            'api_secret' => 'super-secret-value',
        ],
    ], $headers);

    ResponseSnapshot::assertMatches($updated, 'settings-update');

    $shown = $this->getJson("/api/admin/v1/projects/{$project->key}/settings/content", $headers);

    ResponseSnapshot::assertMatches($shown, 'settings-show');
});

test('contract: settings update with unknown key', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    $project = createProjectFor($admin, 'site-a');

    $response = $this->putJson("/api/admin/v1/projects/{$project->key}/settings/content", [
        'values' => ['not_declared' => 'x'],
    ], adminHeaders($admin));

    ResponseSnapshot::assertMatches($response, 'settings-update-unknown-key-422');
});

test('contract: settings update violating manifest rules', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    $project = createProjectFor($admin, 'site-a');

    $response = $this->putJson("/api/admin/v1/projects/{$project->key}/settings/content", [
        'values' => ['per_page' => 0],
    ], adminHeaders($admin));

    ResponseSnapshot::assertMatches($response, 'settings-update-rules-422');
});

test('contract: settings update for unregistered service', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    $project = createProjectFor($admin, 'site-a');

    $response = $this->putJson("/api/admin/v1/projects/{$project->key}/settings/unknown-service", [
        'values' => ['anything' => 1],
    ], adminHeaders($admin));

    ResponseSnapshot::assertMatches($response, 'settings-update-unknown-service-422');
});

test('contract: settings update without values', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    $project = createProjectFor($admin, 'site-a');

    $response = $this->putJson(
        "/api/admin/v1/projects/{$project->key}/settings/content",
        [],
        adminHeaders($admin),
    );

    ResponseSnapshot::assertMatches($response, 'settings-update-missing-values-422');
});

test('contract: settings update forbidden', function () {
    $owner = Admin::factory()->create(['email' => 'owner@example.com', 'name' => 'Owner']);
    $project = createProjectFor($owner, 'site-a');
    $viewer = settingContractViewer($project, 'viewer@example.com');

    // viewer имеет auth.settings.view, но не auth.settings.manage
    $shown = $this->getJson("/api/admin/v1/projects/{$project->key}/settings/content", adminHeaders($viewer));
    ResponseSnapshot::assertMatches($shown, 'settings-show-viewer');

    $updated = $this->putJson("/api/admin/v1/projects/{$project->key}/settings/content", [
        'values' => ['site_title' => 'Hacked'],
    ], adminHeaders($viewer));
    ResponseSnapshot::assertMatches($updated, 'settings-update-403');
});

test('contract: settings show unauthenticated', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    $project = createProjectFor($admin, 'site-a');

    $response = $this->getJson("/api/admin/v1/projects/{$project->key}/settings/content");

    ResponseSnapshot::assertMatches($response, 'settings-show-401');
});
