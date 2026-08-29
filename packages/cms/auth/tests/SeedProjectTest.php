<?php

declare(strict_types=1);

use Cms\Auth\Domain\Models\Admin;
use Cms\Auth\Domain\Models\Project;
use Cms\Auth\Domain\Models\ProjectService;

beforeEach(function () {
    config()->set('cms-auth.initial_project', ['key' => 'main', 'name' => 'Main', 'locales' => ['ru', 'en']]);
});

test('project:seed creates the initial project with every service enabled', function () {
    Admin::factory()->create(['email' => 'root@example.com']);

    $this->artisan('project:seed')->assertSuccessful();

    $project = Project::query()->where('key', 'main')->firstOrFail();

    expect($project->name)->toBe('Main')
        ->and($project->locales)->toBe(['ru', 'en'])
        ->and($project->members()->count())->toBe(1);

    $enabled = ProjectService::query()->where('project_id', $project->id)->where('enabled', true)->pluck('service');
    expect($enabled->all())->toEqualCanonicalizing(config('cms-auth.services'));
});

test('project:seed does nothing when a project already exists', function () {
    Admin::factory()->create();
    $this->artisan('project:seed')->assertSuccessful();

    Project::query()->where('key', 'main')->update(['name' => 'Renamed by operator']);

    $this->artisan('project:seed')->assertSuccessful();

    expect(Project::query()->count())->toBe(1)
        ->and(Project::query()->first()->name)->toBe('Renamed by operator');
});

test('project:seed skips when no operator exists yet', function () {
    $this->artisan('project:seed')->assertSuccessful();

    expect(Project::query()->count())->toBe(0);
});
