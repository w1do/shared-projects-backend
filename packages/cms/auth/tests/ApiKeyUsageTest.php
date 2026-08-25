<?php

declare(strict_types=1);

use Cms\Auth\Domain\Models\Admin;
use Cms\Auth\Domain\Models\ProjectApiKey;
use Cms\Auth\Infrastructure\Jobs\TouchApiKeyLastUsedJob;
use Illuminate\Support\Facades\Queue;

/**
 * Задача 6.2: мутация `last_used_at` уехала из query в Job. Тесты проверяют
 * наблюдаемый результат (значение в БД), а не место записи, — поэтому они
 * остаются валидными и при синхронной, и при асинхронной доставке.
 */
beforeEach(function () {
    config(['cms.service_token' => 'test-service-token']);
    syncAuthManifest();
});

test('api key introspection keeps updating last_used_at', function () {
    $admin = Admin::factory()->create();
    $project = createProjectFor($admin, 'usage-intro');
    $issued = ProjectApiKey::issue($project->id, 'public', ['collect']);

    expect($issued['model']->last_used_at)->toBeNull();

    $this->postJson('/internal/introspect', ['api_key' => $issued['plain']], [
        'Authorization' => 'Service test-service-token',
    ])->assertOk()->assertJsonPath('active', true);

    expect(ProjectApiKey::query()->find($issued['model']->id)->last_used_at)->not->toBeNull();
});

test('site project resolution keeps updating last_used_at', function () {
    $admin = Admin::factory()->create();
    $project = createProjectFor($admin, 'usage-site');
    $issued = ProjectApiKey::issue($project->id, 'public', ['collect']);

    $this->postJson('/api/v1/auth/register', [
        'email' => 'usage@example.com',
        'password' => 'secret-password',
    ], ['X-Api-Key' => $issued['plain']])->assertStatus(201);

    expect(ProjectApiKey::query()->find($issued['model']->id)->last_used_at)->not->toBeNull();
});

test('both entry points mark key usage through the same job', function () {
    Queue::fake();

    $admin = Admin::factory()->create();
    $project = createProjectFor($admin, 'usage-job');
    $issued = ProjectApiKey::issue($project->id, 'public', ['collect']);

    $this->postJson('/internal/introspect', ['api_key' => $issued['plain']], [
        'Authorization' => 'Service test-service-token',
    ])->assertOk();

    $this->getJson('/api/v1/auth/me', ['X-Api-Key' => $issued['plain']])->assertStatus(401);

    Queue::assertPushed(
        TouchApiKeyLastUsedJob::class,
        fn (TouchApiKeyLastUsedJob $job) => $job->keyId === $issued['model']->id,
    );
    Queue::assertPushed(TouchApiKeyLastUsedJob::class, 2);
});
