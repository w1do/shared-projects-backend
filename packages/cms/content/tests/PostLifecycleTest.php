<?php

declare(strict_types=1);

use Cms\Content\Application\Handlers\ChangeStatusHandler;
use Cms\Content\Domain\Enums\ContentStatus;
use Cms\Content\Domain\Models\Post;
use Cms\Content\Infrastructure\Jobs\PublishScheduledJob;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Queue;

test('post crud with categories and revisions', function () {
    $headers = actingAsContentOperator();

    $cat = $this->postJson('/api/admin/v1/projects/proj-1/content/categories', ['name' => 'News'], $headers)
        ->assertCreated()->json('data');

    $post = $this->postJson('/api/admin/v1/projects/proj-1/content/posts', [
        'title' => 'Hello', 'blocks' => [['title' => '', 'markdown' => 'v1']], 'categories' => [$cat['id']],
    ], $headers)->assertCreated()->json('data');

    expect($post['slug'])->toBe('hello')->and($post['categories'])->toBe([$cat['id']]);

    $this->putJson("/api/admin/v1/projects/proj-1/content/posts/{$post['id']}", [
        'title' => 'Hello', 'blocks' => [['title' => '', 'markdown' => 'v2']],
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

test('post is deleted with its seo, revisions and relations', function () {
    $headers = actingAsContentOperator();

    $category = $this->postJson('/api/admin/v1/projects/proj-1/content/categories', ['name' => 'Авто'], $headers)
        ->assertCreated()->json('data');

    $post = $this->postJson('/api/admin/v1/projects/proj-1/content/posts', [
        'title' => 'Пост под удаление',
        'categories' => [$category['id']],
        'tags' => ['седаны'],
    ], $headers)->assertCreated()->json('data');

    $this->putJson("/api/admin/v1/projects/proj-1/content/seo/post/{$post['id']}", [
        'title' => 'SEO заголовок',
    ], $headers)->assertOk();

    $this->deleteJson("/api/admin/v1/projects/proj-1/content/posts/{$post['id']}", [], $headers)
        ->assertNoContent();

    $this->getJson("/api/admin/v1/projects/proj-1/content/posts/{$post['id']}", $headers)
        ->assertNotFound();

    expect(DB::table('posts')->where('id', $post['id'])->count())->toBe(0)
        ->and(DB::table('seo_meta')->where('seoable_type', Post::class)->where('seoable_id', $post['id'])->count())->toBe(0)
        ->and(DB::table('revisions')->where('revisable_type', Post::class)->where('revisable_id', $post['id'])->count())->toBe(0)
        ->and(DB::table('category_post')->where('post_id', $post['id'])->count())->toBe(0)
        ->and(DB::table('taggables')->where('taggable_id', $post['id'])->count())->toBe(0)
        // тег проекта остаётся: удаляется пост, а не словарь тегов
        ->and(DB::table('tags')->count())->toBe(1);
});

test('a draft post is deleted without any status transition', function () {
    $headers = actingAsContentOperator();

    $post = $this->postJson('/api/admin/v1/projects/proj-1/content/posts', ['title' => 'Черновик'], $headers)
        ->assertCreated()->json('data');

    expect($post['status'])->toBe('draft');

    $this->deleteJson("/api/admin/v1/projects/proj-1/content/posts/{$post['id']}", [], $headers)
        ->assertNoContent();
});

test('an archived post is deleted as well', function () {
    $headers = actingAsContentOperator();

    $post = $this->postJson('/api/admin/v1/projects/proj-1/content/posts', ['title' => 'Архивный'], $headers)
        ->assertCreated()->json('data');

    $this->postJson("/api/admin/v1/projects/proj-1/content/posts/{$post['id']}/status", ['status' => 'published'], $headers)
        ->assertOk();
    $this->postJson("/api/admin/v1/projects/proj-1/content/posts/{$post['id']}/status", ['status' => 'archived'], $headers)
        ->assertOk();

    $this->deleteJson("/api/admin/v1/projects/proj-1/content/posts/{$post['id']}", [], $headers)
        ->assertNoContent();

    expect(DB::table('posts')->where('id', $post['id'])->count())->toBe(0);
});

test('post of another project is not deletable', function () {
    $post = $this->postJson('/api/admin/v1/projects/proj-1/content/posts', ['title' => 'Чужой'], actingAsContentOperator())
        ->assertCreated()->json('data');

    $this->deleteJson(
        "/api/admin/v1/projects/proj-2/content/posts/{$post['id']}",
        [],
        actingAsContentOperator('proj-2'),
    )->assertNotFound();

    expect(DB::table('posts')->where('id', $post['id'])->count())->toBe(1);
});

test('delete is refused without the manage permission', function () {
    $post = $this->postJson('/api/admin/v1/projects/proj-1/content/posts', ['title' => 'Пост'], actingAsContentOperator())
        ->assertCreated()->json('data');

    $this->deleteJson(
        "/api/admin/v1/projects/proj-1/content/posts/{$post['id']}",
        [],
        actingAsContentOperator('proj-1', ['content.posts.view']),
    )->assertForbidden();

    expect(DB::table('posts')->where('id', $post['id'])->count())->toBe(1);
});
