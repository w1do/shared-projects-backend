<?php

declare(strict_types=1);

use Cms\Auth\Domain\Models\Admin;
use Cms\Shared\Testing\ResponseSnapshot;

/** Характеризационные снимки контракта каталога прав проекта. */
beforeEach(function () {
    syncAuthManifest();
});

test('contract: permissions index', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    $project = createProjectFor($admin, 'site-a');

    $response = $this->getJson("/api/admin/v1/projects/{$project->key}/permissions", adminHeaders($admin));

    ResponseSnapshot::assertMatches($response, 'permissions-index');
});

test('contract: permissions index unauthenticated', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    $project = createProjectFor($admin, 'site-a');

    $response = $this->getJson("/api/admin/v1/projects/{$project->key}/permissions");

    ResponseSnapshot::assertMatches($response, 'permissions-index-401');
});
