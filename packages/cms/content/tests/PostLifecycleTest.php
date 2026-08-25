<?php

declare(strict_types=1);

use Cms\Content\Application\Handlers\ChangeStatusHandler;
use Cms\Content\Domain\Enums\ContentStatus;
use Cms\Content\Domain\Models\Post;
use Cms\Content\Infrastructure\Jobs\PublishScheduledJob;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Support\Facades\Queue;

test('post crud with categories and revisions', function () {
    $headers = actingAsContentOperator();

    $cat = $this->postJson('/api/admin/v1/projects/proj-1/content/categories', ['name' => 'News'], $headers)
        ->assertCreated()->json('data');

    $post = $this->postJson('/api/admin/v1/projects/proj-1/content/posts', [
        'title' => 'Hello', 'body' => 'v1', 'categories' => [$cat['id']],
    ], $headers)->assertCreated()->json('data');

    expect($post['slug'])->toBe('hello')->and($post['categories'])->toBe([$cat['id']]);

    $this->putJson("/api/admin/v1/projects/proj-1/content/posts/{$post['id']}", [
        'title' => 'Hello', 'body' => 'v2',
    ], $headers)->assertOk();

    $revisions = $this->getJson("/api/admin/v1/projects/proj-1/content/posts/{$post['id']}/revisions", $headers)
        ->assertOk()->json('data');
    expect($revisions)->toHaveCount(2);

    // Восстановление из первой ревизии
    $first = end($revisions);
    $restored = $this->postJson("/api/admin/v1/projects/proj-1/content/posts/{$post['id']}/revisions/{$first['id']}/restore", [], $headers)
        ->assertOk()->json('data');
    expect($restored['body'])->toBe('v1');
});

test('status machine rejects invalid transitions', function () {
    Queue::fake();
    $headers = actingAsContentOperator();

    $post = $this->postJson('/api/admin/v1/projects/proj-1/content/posts', ['title' => 'S'], $headers)->json('data');

    // draft → archived запрещён
    $this->postJson("/api/admin/v1/projects/proj-1/content/posts/{$post['id']}/status", ['status' => 'archived'], $headers)
        ->assertStatus(422);

    // draft → published разрешён
    $this->postJson("/api/admin/v1/projects/proj-1/content/posts/{$post['id']}/status", ['status' => 'published'], $headers)
        ->assertOk()->assertJsonPath('data.status', 'published');

    // published → draft запрещён
    $this->postJson("/api/admin/v1/projects/proj-1/content/posts/{$post['id']}/status", ['status' => 'draft'], $headers)
        ->assertStatus(422);
});

test('scheduled post publishes automatically when the time comes', function () {
    $headers = actingAsContentOperator();

    $post = $this->postJson('/api/admin/v1/projects/proj-1/content/posts', ['title' => 'Later'], $headers)->json('data');

    $this->postJson("/api/admin/v1/projects/proj-1/content/posts/{$post['id']}/status", [
        'status' => 'scheduled', 'scheduled_at' => now()->addMinute()->toIso8601String(),
    ], $headers)->assertOk();

    $this->travel(2)->minutes();
    (new PublishScheduledJob)->handle(app(ChangeStatusHandler::class), app(ProjectContext::class));

    app(ProjectContext::class)->set('proj-1');
    expect(Post::query()->find($post['id'])->status)->toBe(ContentStatus::Published);
});

test('duplicate slug within a project and locale is rejected', function () {
    $headers = actingAsContentOperator();

    $this->postJson('/api/admin/v1/projects/proj-1/content/posts', ['title' => 'Same', 'slug' => 'same'], $headers)->assertCreated();
    $this->postJson('/api/admin/v1/projects/proj-1/content/posts', ['title' => 'Same 2', 'slug' => 'same'], $headers)
        ->assertStatus(422);
});
