<?php

declare(strict_types=1);

use Cms\Auth\Domain\Models\Admin;
use Cms\Auth\Domain\Models\Project;
use Cms\Shared\Testing\ResponseSnapshot;
use Spatie\Permission\PermissionRegistrar;

/**
 * Характеризационные снимки контракта настроек сайта (spatie/laravel-settings,
 * tenant-scoped): defaults достраиваются при первом чтении, PUT сохраняет
 * значения per-project.
 */
beforeEach(function () {
    syncAuthManifest();
});

/** Участник проекта с ролью viewer — источник 403-веток PUT. */
function siteSettingContractViewer(Project $project, string $email): Admin
{
    $viewer = Admin::factory()->create(['email' => $email, 'name' => 'Viewer']);
    $project->members()->attach($viewer->id);

    $registrar = app(PermissionRegistrar::class);
    $registrar->setPermissionsTeamId($project->id);
    $viewer->assignRole('viewer');
    $registrar->setPermissionsTeamId(null);

    return $viewer;
}

test('contract: site settings show defaults', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    $project = createProjectFor($admin, 'site-a');

    $response = $this->getJson("/api/admin/v1/projects/{$project->key}/site-settings", adminHeaders($admin));

    ResponseSnapshot::assertMatches($response, 'site-settings-show-defaults');
});

test('contract: site settings update persists values', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    $project = createProjectFor($admin, 'site-a', ['ru', 'en']);
    $headers = adminHeaders($admin);

    $updated = $this->putJson("/api/admin/v1/projects/{$project->key}/site-settings", [
        'project_type' => 'shop',
        'timezone' => 'Asia/Yekaterinburg',
        'language' => 'en',
        'currency_default' => 'USD',
        'currencies' => ['USD', 'RUB'],
    ], $headers);

    ResponseSnapshot::assertMatches($updated, 'site-settings-update');

    $shown = $this->getJson("/api/admin/v1/projects/{$project->key}/site-settings", $headers);

    ResponseSnapshot::assertMatches($shown, 'site-settings-show-updated');
});

test('contract: site settings update rejects default currency outside the list', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    $project = createProjectFor($admin, 'site-a');

    $response = $this->putJson("/api/admin/v1/projects/{$project->key}/site-settings", [
        'project_type' => 'blog',
        'timezone' => 'Europe/Moscow',
        'language' => 'ru',
        'currency_default' => 'USD',
        'currencies' => ['RUB'],
    ], adminHeaders($admin));

    ResponseSnapshot::assertMatches($response, 'site-settings-update-422');
});

test('contract: site settings update without manage permission is 403', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    $project = createProjectFor($admin, 'site-a');
    $viewer = siteSettingContractViewer($project, 'viewer@example.com');

    $response = $this->putJson("/api/admin/v1/projects/{$project->key}/site-settings", [
        'project_type' => 'blog',
        'timezone' => 'Europe/Moscow',
        'language' => 'ru',
        'currency_default' => 'RUB',
        'currencies' => ['RUB', 'USD'],
    ], adminHeaders($viewer));

    ResponseSnapshot::assertMatches($response, 'site-settings-update-403');
});

test('contract: site settings update rejects unknown project type and timezone', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    $project = createProjectFor($admin, 'site-a');

    $response = $this->putJson("/api/admin/v1/projects/{$project->key}/site-settings", [
        'project_type' => 'marketplace',
        'timezone' => 'America/Los_Angeles',
        'language' => 'ru',
        'currency_default' => 'RUB',
        'currencies' => ['RUB'],
    ], adminHeaders($admin));

    ResponseSnapshot::assertMatches($response, 'site-settings-update-422-type-timezone');
});

test('contract: site settings update rejects a language outside the project locales', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    $project = createProjectFor($admin, 'site-a');

    $response = $this->putJson("/api/admin/v1/projects/{$project->key}/site-settings", [
        'project_type' => 'blog',
        'timezone' => 'Europe/Moscow',
        'language' => 'en',
        'currency_default' => 'RUB',
        'currencies' => ['RUB'],
    ], adminHeaders($admin));

    ResponseSnapshot::assertMatches($response, 'site-settings-update-422-language');
});
