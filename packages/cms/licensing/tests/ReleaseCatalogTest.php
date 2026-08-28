<?php

declare(strict_types=1);

use Cms\Licensing\Domain\Models\Release;
use Cms\Shared\Tenant\ProjectContext;

// ---------------------------------------------------------- CRUD каталога

test('release crud works through admin endpoints', function () {
    $headers = licensingOperator();
    app(ProjectContext::class)->set('proj-1');

    $created = $this->postJson(licensingUrl('releases'), [
        'version' => '1.4.7',
        'train' => '1.4',
        'repository' => 'crm/app-1.4',
        'released_at' => '2026-01-10T00:00:00+00:00',
        'is_security' => false,
        'changelog_url' => 'https://changelog.example/1.4.7',
    ], $headers)->assertCreated();

    $releaseId = $created->json('data.id');
    expect($created->json('data.version'))->toBe('1.4.7')
        ->and($created->json('data.train'))->toBe('1.4')
        ->and($created->json('data.is_security'))->toBeFalse();

    $this->getJson(licensingUrl('releases'), $headers)
        ->assertOk()
        ->assertJsonPath('data.0.version', '1.4.7');

    $this->putJson(licensingUrl("releases/{$releaseId}"), [
        'version' => '1.4.7',
        'train' => '1.4',
        'repository' => 'crm/app-1.4',
        'released_at' => '2026-01-10T00:00:00+00:00',
        'is_security' => true,
    ], $headers)->assertOk()->assertJsonPath('data.is_security', true);

    $this->deleteJson(licensingUrl("releases/{$releaseId}"), [], $headers)->assertNoContent();
    expect(Release::query()->count())->toBe(0);
});

test('duplicate version in the project is rejected', function () {
    $headers = licensingOperator();
    app(ProjectContext::class)->set('proj-1');
    Release::factory()->version('1.4.7')->create();

    $response = $this->postJson(licensingUrl('releases'), [
        'version' => '1.4.7',
        'train' => '1.4',
        'repository' => 'crm/app-1.4',
        'released_at' => '2026-02-01T00:00:00+00:00',
    ], $headers)->assertStatus(422);

    expect($response->json('error.details.version.0'))
        ->toBe('Release version is already registered in the project.')
        ->and(Release::query()->count())->toBe(1);
});

test('update keeps its own version without a false duplicate', function () {
    $headers = licensingOperator();
    app(ProjectContext::class)->set('proj-1');
    $release = Release::factory()->version('1.4.7')->create();

    $this->putJson(licensingUrl("releases/{$release->id}"), [
        'version' => '1.4.7',
        'train' => '1.4',
        'repository' => 'crm/app-1.4-mirror',
        'released_at' => '2026-01-10T00:00:00+00:00',
    ], $headers)->assertOk()->assertJsonPath('data.repository', 'crm/app-1.4-mirror');
});

test('invalid semver or train is rejected by validation', function () {
    $headers = licensingOperator();

    $this->postJson(licensingUrl('releases'), [
        'version' => 'v1.4',
        'train' => '1.4.x',
        'repository' => 'crm/app-1.4',
        'released_at' => '2026-01-10T00:00:00+00:00',
    ], $headers)->assertStatus(422);
});

// ------------------------------------------------------- tenant-изоляция

test('release catalog is tenant isolated', function () {
    $headers = licensingOperator();
    app(ProjectContext::class)->set('proj-2');
    $foreign = Release::factory()->version('9.9.9')->create(['project_id' => 'proj-2']);
    app(ProjectContext::class)->set('proj-1');
    Release::factory()->version('1.0.0')->create();

    // чужой релиз не виден, не читается и версия не конфликтует
    $list = $this->getJson(licensingUrl('releases'), $headers)->assertOk();
    expect(collect($list->json('data'))->pluck('version')->all())->toBe(['1.0.0']);

    $this->getJson(licensingUrl("releases/{$foreign->id}"), $headers)->assertNotFound();

    $this->postJson(licensingUrl('releases'), [
        'version' => '9.9.9',
        'train' => '9.9',
        'repository' => 'crm/app-9.9',
        'released_at' => '2026-01-10T00:00:00+00:00',
    ], $headers)->assertCreated();
});

test('release management requires the manage permission', function () {
    $headers = licensingOperator(permissions: ['pay.licensing.view']);

    $this->getJson(licensingUrl('releases'), $headers)->assertOk();
    $this->postJson(licensingUrl('releases'), [
        'version' => '1.0.0',
        'train' => '1.0',
        'repository' => 'crm/app-1.0',
        'released_at' => '2026-01-10T00:00:00+00:00',
    ], $headers)->assertForbidden();
});
