<?php

declare(strict_types=1);

use Cms\Auth\Domain\Models\Admin;
use Cms\Auth\Domain\Models\ProjectApiKey;
use Cms\Auth\Domain\Models\User;
use Cms\Shared\Analytics\AnalyticsRecorder;
use Cms\Shared\Jobs\SendAnalyticsEventJob;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Http;

beforeEach(fn () => syncAuthManifest());

test('operator manages project users: list, block, unblock, delete', function () {
    $admin = Admin::factory()->create();
    $project = createProjectFor($admin, 'usrs');
    $headers = adminHeaders($admin);

    $user = User::factory()->create(['project_id' => $project->id]);

    $this->getJson('/api/admin/v1/projects/usrs/users', $headers)
        ->assertOk()->assertJsonPath('data.0.email', $user->email);

    $this->postJson("/api/admin/v1/projects/usrs/users/{$user->id}/block", [], $headers)
        ->assertOk()->assertJsonPath('data.blocked', true);

    $this->postJson("/api/admin/v1/projects/usrs/users/{$user->id}/unblock", [], $headers)
        ->assertOk()->assertJsonPath('data.blocked', false);

    $this->deleteJson("/api/admin/v1/projects/usrs/users/{$user->id}", [], $headers)
        ->assertNoContent();

    expect(User::acrossProjects()->whereKey($user->id)->exists())->toBeFalse();
});

test('users of another project are not visible', function () {
    $admin = Admin::factory()->create();
    $a = createProjectFor($admin, 'ua');
    $b = createProjectFor($admin, 'ub');
    User::factory()->create(['project_id' => $b->id]);

    $this->getJson('/api/admin/v1/projects/ua/users', adminHeaders($admin))
        ->assertOk()->assertJsonCount(0, 'data');
});

test('auth events are pushed to analytics asynchronously', function () {
    config(['cms.analytics_url' => 'http://analytics-service:8000']);
    // Перебиндить рекордер с учётом нового конфига
    app()->forgetInstance(AnalyticsRecorder::class);
    Bus::fake([SendAnalyticsEventJob::class]);

    $admin = Admin::factory()->create();
    $project = createProjectFor($admin, 'ev');
    $key = ProjectApiKey::issue($project->id, 'public', ['collect'])['plain'];

    $this->postJson('/api/v1/auth/register', ['email' => 'e@example.com', 'password' => 'secret-123'], ['X-Api-Key' => $key])
        ->assertCreated();
    $this->postJson('/api/v1/auth/login', ['email' => 'e@example.com', 'password' => 'secret-123'], ['X-Api-Key' => $key])
        ->assertOk();

    Bus::assertDispatched(SendAnalyticsEventJob::class, function (SendAnalyticsEventJob $job) use ($project) {
        return $job->event['name'] === 'user.registered' && $job->event['project_id'] === $project->id;
    });
    Bus::assertDispatched(SendAnalyticsEventJob::class, fn (SendAnalyticsEventJob $job) => $job->event['name'] === 'user.login');
});

test('analytics unavailability does not break login', function () {
    config(['cms.analytics_url' => 'http://analytics-service:8000']);
    app()->forgetInstance(AnalyticsRecorder::class);
    // Джоба уйдёт в очередь (sync-драйвер в тестах) и упадёт — логин должен пройти
    Http::fake(fn () => Http::response('down', 500));

    $admin = Admin::factory()->create();
    $project = createProjectFor($admin, 'ev2');
    $key = ProjectApiKey::issue($project->id, 'public', ['collect'])['plain'];

    config(['queue.default' => 'database']); // не выполнять джобу синхронно

    $this->postJson('/api/v1/auth/register', ['email' => 'q@example.com', 'password' => 'secret-123'], ['X-Api-Key' => $key])
        ->assertCreated();
});

test('cache bust webhook is sent to downstream services on role change', function () {
    config(['cms-auth.downstream_urls' => ['http://content-service:8000'], 'cms.service_token' => 'svc']);
    Http::fake();

    $admin = Admin::factory()->create();
    $project = createProjectFor($admin, 'cb');
    $member = Admin::factory()->create();
    $project->members()->attach($member->id);

    $this->putJson("/api/admin/v1/projects/cb/members/{$member->id}/role", ['role' => 'viewer'], adminHeaders($admin))
        ->assertOk();

    Http::assertSent(fn ($request) => str_contains($request->url(), '/internal/cache-bust')
        && $request['reason'] === 'roles_changed');
});
