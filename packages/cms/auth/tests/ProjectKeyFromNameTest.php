<?php

declare(strict_types=1);

use Cms\Auth\Domain\Enums\SystemRole;
use Cms\Auth\Domain\Models\Admin;
use Cms\Auth\Domain\Models\Project;
use Cms\Auth\Domain\Models\ProjectService;
use Cms\Auth\Infrastructure\Persistence\AdminPermissionResolver;

beforeEach(fn () => syncAuthManifest());

test('a project is created from the name alone', function () {
    $admin = Admin::factory()->create();

    $this->postJson('/api/admin/v1/projects', ['name' => 'Shop'], adminHeaders($admin))
        ->assertCreated()
        ->assertJsonPath('data.key', 'shop')
        ->assertJsonPath('data.name', 'Shop');
});

test('a cyrillic name is transliterated into the key', function () {
    $admin = Admin::factory()->create();

    $this->postJson('/api/admin/v1/projects', ['name' => 'Автомобили и мотоциклы'], adminHeaders($admin))
        ->assertCreated()
        ->assertJsonPath('data.key', 'avtomobili-i-motocikly');
});

test('two projects with the same name get different keys', function () {
    $admin = Admin::factory()->create();
    $headers = adminHeaders($admin);

    $first = $this->postJson('/api/admin/v1/projects', ['name' => 'Shop'], $headers)
        ->assertCreated()->json('data.key');
    $second = $this->postJson('/api/admin/v1/projects', ['name' => 'Shop'], $headers)
        ->assertCreated()->json('data.key');
    $third = $this->postJson('/api/admin/v1/projects', ['name' => 'Shop'], $headers)
        ->assertCreated()->json('data.key');

    expect([$first, $second, $third])->toBe(['shop', 'shop-2', 'shop-3']);
});

test('a name without latinizable characters still yields a key', function () {
    $admin = Admin::factory()->create();

    $this->postJson('/api/admin/v1/projects', ['name' => '?!'], adminHeaders($admin))
        ->assertCreated()
        ->assertJsonPath('data.key', 'project');
});

test('a derived key fits the key column limit', function () {
    $admin = Admin::factory()->create();

    $key = $this->postJson('/api/admin/v1/projects', ['name' => str_repeat('Very long project name ', 10)], adminHeaders($admin))
        ->assertCreated()->json('data.key');

    expect(strlen($key))->toBeLessThanOrEqual(64);
});

test('a project created from the name is empty and fully owned by its creator', function () {
    $admin = Admin::factory()->create();

    $this->postJson('/api/admin/v1/projects', ['name' => 'Fresh'], adminHeaders($admin))->assertCreated();

    $project = Project::query()->where('key', 'fresh')->firstOrFail();

    expect($project->members()->pluck('admin_id')->all())->toBe([$admin->id]);

    app(AdminPermissionResolver::class)->withTeam($project->id, function () use ($admin): void {
        expect($admin->fresh()->hasRole(SystemRole::Owner->value))->toBeTrue();
    });

    $enabled = ProjectService::query()->where('project_id', $project->id)->where('enabled', true)->pluck('service');
    expect($enabled->all())->toEqualCanonicalizing((array) config('cms-auth.default_enabled_services'));
});

test('an explicitly passed key that is taken is still rejected', function () {
    $admin = Admin::factory()->create();
    createProjectFor($admin, 'taken');

    $this->postJson('/api/admin/v1/projects', ['key' => 'taken', 'name' => 'Other'], adminHeaders($admin))
        ->assertStatus(422)
        ->assertJsonPath('error.code', 'validation_failed');

    expect(Project::query()->where('name', 'Other')->exists())->toBeFalse();
});

test('an explicitly passed free key is used as is', function () {
    $admin = Admin::factory()->create();

    $this->postJson('/api/admin/v1/projects', ['key' => 'custom-key', 'name' => 'Shop'], adminHeaders($admin))
        ->assertCreated()
        ->assertJsonPath('data.key', 'custom-key');
});

test('a project cannot be created without a name', function () {
    $admin = Admin::factory()->create();

    $this->postJson('/api/admin/v1/projects', [], adminHeaders($admin))
        ->assertStatus(422)
        ->assertJsonPath('error.details.name.0', 'The name field is required.');
});
