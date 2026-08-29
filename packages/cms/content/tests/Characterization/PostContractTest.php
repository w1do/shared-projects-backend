<?php

declare(strict_types=1);

use Cms\Content\Domain\Models\Post;
use Cms\Shared\Tenant\ProjectContext;
use Cms\Shared\Testing\ResponseSnapshot;
use Illuminate\Support\Facades\Storage;

/**
 * Характеризационные снимки контракта постов (routes/admin.php).
 * Все значения фикстур заданы явно: faker-значения фабрик сделали бы
 * снимок недетерминированным.
 */
beforeEach(function () {
    Storage::fake('local');
    config(['cms-content.site_url' => 'https://site.test']);
});

/** Пост с полностью зафиксированными атрибутами. */
function contractPost(array $attributes): Post
{
    return Post::factory()->create($attributes + [
        'title' => 'Fixed title',
        'slug' => 'fixed-title',
        'body' => 'Fixed body',
        'locale' => 'ru',
    ]);
}

test('contract: content posts index', function () {
    $headers = actingAsContentOperator();

    $category = $this->postJson('/api/admin/v1/projects/proj-1/content/categories', [
        'name' => 'News', 'slug' => 'news',
    ], $headers)->json('data');

    $first = $this->postJson('/api/admin/v1/projects/proj-1/content/posts', [
        'title' => 'First post', 'slug' => 'first-post', 'body' => 'First body',
        'locale' => 'ru', 'categories' => [$category['id']], 'is_index' => true,
    ], $headers)->json('data');

    $this->postJson('/api/admin/v1/projects/proj-1/content/posts', [
        'title' => 'Second post', 'slug' => 'second-post', 'body' => 'Second body',
        'locale' => 'en', 'translation_group' => 'group-a', 'is_index' => false,
    ], $headers);

    $this->putJson("/api/admin/v1/projects/proj-1/content/seo/post/{$first['id']}", [
        'title' => 'First post — seo', 'robots' => 'index,follow',
    ], $headers);

    ResponseSnapshot::assertMatches(
        $this->getJson('/api/admin/v1/projects/proj-1/content/posts', $headers),
        'posts-index',
    );

    ResponseSnapshot::assertMatches(
        $this->getJson('/api/admin/v1/projects/proj-1/content/posts?status=draft&locale=en', $headers),
        'posts-index-filtered',
    );

    ResponseSnapshot::assertMatches(
        $this->getJson("/api/admin/v1/projects/proj-1/content/posts?category={$category['id']}", $headers),
        'posts-index-by-category',
    );
});

test('contract: content posts index empty', function () {
    $headers = actingAsContentOperator();

    ResponseSnapshot::assertMatches(
        $this->getJson('/api/admin/v1/projects/proj-1/content/posts', $headers),
        'posts-index-empty',
    );
});

test('contract: content posts index cursor pagination', function () {
    $headers = actingAsContentOperator();
    app(ProjectContext::class)->set('proj-1');

    // 26 постов при perPage=25 — вторая страница и непустой next_cursor
    foreach (range(1, 26) as $n) {
        $number = str_pad((string) $n, 2, '0', STR_PAD_LEFT);
        contractPost([
            'title' => "Post {$number}",
            'slug' => "post-{$number}",
            'body' => "Body {$number}",
            'locale' => 'ru',
        ]);
    }

    $first = $this->getJson('/api/admin/v1/projects/proj-1/content/posts', $headers);
    ResponseSnapshot::assertMatches($first, 'posts-index-cursor-first-page');

    expect($first->json('meta.per_page'))->toBe(25)
        ->and($first->json('data'))->toHaveCount(25)
        ->and($first->json('meta.prev_cursor'))->toBeNull();

    $cursor = $first->json('meta.next_cursor');
    expect($cursor)->toBeString();

    ResponseSnapshot::assertMatches(
        $this->getJson('/api/admin/v1/projects/proj-1/content/posts?cursor='.urlencode($cursor), $headers),
        'posts-index-cursor-second-page',
    );
});

test('contract: content posts store', function () {
    $headers = actingAsContentOperator();

    $category = $this->postJson('/api/admin/v1/projects/proj-1/content/categories', [
        'name' => 'News', 'slug' => 'news',
    ], $headers)->json('data');

    ResponseSnapshot::assertMatches(
        $this->postJson('/api/admin/v1/projects/proj-1/content/posts', [
            'title' => 'Hello world', 'slug' => 'hello-world', 'body' => 'Body text',
            'locale' => 'ru', 'translation_group' => 'group-a',
            'categories' => [$category['id']], 'is_index' => true,
        ], $headers),
        'posts-store',
    );
});

test('contract: content posts store minimal payload', function () {
    $headers = actingAsContentOperator();

    // slug и locale не переданы: фиксируем дефолты (Str::slug + значение модели)
    ResponseSnapshot::assertMatches(
        $this->postJson('/api/admin/v1/projects/proj-1/content/posts', [
            'title' => 'Hello world',
        ], $headers),
        'posts-store-defaults',
    );
});

test('contract: content posts store validation error', function () {
    $headers = actingAsContentOperator();

    ResponseSnapshot::assertMatches(
        $this->postJson('/api/admin/v1/projects/proj-1/content/posts', [
            'title' => '', 'slug' => 'not a slug', 'body' => ['array'],
            'locale' => 'much-too-long-locale', 'translation_group' => str_repeat('x', 65),
            'categories' => 'nope', 'is_index' => 'maybe',
        ], $headers),
        'posts-store-422',
    );
});

test('contract: content posts store rejects duplicate slug', function () {
    $headers = actingAsContentOperator();

    $this->postJson('/api/admin/v1/projects/proj-1/content/posts', [
        'title' => 'Original', 'slug' => 'shared-slug', 'locale' => 'ru',
    ], $headers)->assertCreated();

    $response = $this->postJson('/api/admin/v1/projects/proj-1/content/posts', [
        'title' => 'Duplicate', 'slug' => 'shared-slug', 'locale' => 'ru',
    ], $headers);

    ResponseSnapshot::assertMatches($response, 'posts-store-422-duplicate-slug');
});

test('contract: content posts show', function () {
    $headers = actingAsContentOperator();

    $category = $this->postJson('/api/admin/v1/projects/proj-1/content/categories', [
        'name' => 'News', 'slug' => 'news',
    ], $headers)->json('data');

    $post = $this->postJson('/api/admin/v1/projects/proj-1/content/posts', [
        'title' => 'Hello world', 'slug' => 'hello-world', 'body' => 'Body text',
        'locale' => 'ru', 'categories' => [$category['id']],
    ], $headers)->json('data');

    $this->putJson("/api/admin/v1/projects/proj-1/content/seo/post/{$post['id']}", [
        'title' => 'Hello — seo', 'description' => 'Seo description',
        'canonical' => 'https://site.test/hello-world', 'twitter_card' => 'summary',
    ], $headers);

    ResponseSnapshot::assertMatches(
        $this->getJson("/api/admin/v1/projects/proj-1/content/posts/{$post['id']}", $headers),
        'posts-show',
    );
});

test('contract: content posts show not found', function () {
    $headers = actingAsContentOperator();

    ResponseSnapshot::assertMatches(
        $this->getJson('/api/admin/v1/projects/proj-1/content/posts/999', $headers),
        'posts-show-404',
    );
});

test('contract: content posts update', function () {
    $headers = actingAsContentOperator();

    $post = $this->postJson('/api/admin/v1/projects/proj-1/content/posts', [
        'title' => 'Hello world', 'slug' => 'hello-world', 'body' => 'v1', 'locale' => 'ru',
    ], $headers)->json('data');

    ResponseSnapshot::assertMatches(
        $this->putJson("/api/admin/v1/projects/proj-1/content/posts/{$post['id']}", [
            'title' => 'Hello world v2', 'slug' => 'hello-world', 'body' => 'v2', 'locale' => 'ru',
        ], $headers),
        'posts-update',
    );
});

test('contract: content posts update validation error', function () {
    $headers = actingAsContentOperator();

    $post = $this->postJson('/api/admin/v1/projects/proj-1/content/posts', [
        'title' => 'Hello world', 'slug' => 'hello-world',
    ], $headers)->json('data');

    ResponseSnapshot::assertMatches(
        $this->putJson("/api/admin/v1/projects/proj-1/content/posts/{$post['id']}", [
            'title' => '',
        ], $headers),
        'posts-update-422',
    );
});

test('contract: content posts update not found', function () {
    $headers = actingAsContentOperator();

    ResponseSnapshot::assertMatches(
        $this->putJson('/api/admin/v1/projects/proj-1/content/posts/999', [
            'title' => 'Ghost',
        ], $headers),
        'posts-update-404',
    );
});

test('contract: content posts change status', function () {
    $headers = actingAsContentOperator();

    $post = $this->postJson('/api/admin/v1/projects/proj-1/content/posts', [
        'title' => 'Hello world', 'slug' => 'hello-world', 'body' => 'Body text', 'locale' => 'ru',
    ], $headers)->json('data');

    ResponseSnapshot::assertMatches(
        $this->postJson("/api/admin/v1/projects/proj-1/content/posts/{$post['id']}/status", [
            'status' => 'published',
        ], $headers),
        'posts-status-published',
    );

    ResponseSnapshot::assertMatches(
        $this->postJson("/api/admin/v1/projects/proj-1/content/posts/{$post['id']}/status", [
            'status' => 'archived',
        ], $headers),
        'posts-status-archived',
    );
});

test('contract: content posts change status scheduled', function () {
    $headers = actingAsContentOperator();

    $post = $this->postJson('/api/admin/v1/projects/proj-1/content/posts', [
        'title' => 'Later', 'slug' => 'later', 'locale' => 'ru',
    ], $headers)->json('data');

    ResponseSnapshot::assertMatches(
        $this->postJson("/api/admin/v1/projects/proj-1/content/posts/{$post['id']}/status", [
            'status' => 'scheduled', 'scheduled_at' => '2099-01-01T00:00:00+00:00',
        ], $headers),
        'posts-status-scheduled',
    );
});

test('contract: content posts change status validation error', function () {
    $headers = actingAsContentOperator();

    $post = $this->postJson('/api/admin/v1/projects/proj-1/content/posts', [
        'title' => 'Hello world', 'slug' => 'hello-world',
    ], $headers)->json('data');

    ResponseSnapshot::assertMatches(
        $this->postJson("/api/admin/v1/projects/proj-1/content/posts/{$post['id']}/status", [
            'status' => 'nonsense',
        ], $headers),
        'posts-status-422',
    );

    ResponseSnapshot::assertMatches(
        $this->postJson("/api/admin/v1/projects/proj-1/content/posts/{$post['id']}/status", [
            'status' => 'scheduled',
        ], $headers),
        'posts-status-422-missing-schedule',
    );

    ResponseSnapshot::assertMatches(
        $this->postJson("/api/admin/v1/projects/proj-1/content/posts/{$post['id']}/status", [
            'status' => 'scheduled', 'scheduled_at' => '2000-01-01T00:00:00+00:00',
        ], $headers),
        'posts-status-422-past-schedule',
    );
});

test('contract: content posts change status forbidden transition', function () {
    $headers = actingAsContentOperator();

    $post = $this->postJson('/api/admin/v1/projects/proj-1/content/posts', [
        'title' => 'Hello world', 'slug' => 'hello-world',
    ], $headers)->json('data');

    // draft → archived запрещён статус-машиной: 422 из ChangeStatusHandler
    ResponseSnapshot::assertMatches(
        $this->postJson("/api/admin/v1/projects/proj-1/content/posts/{$post['id']}/status", [
            'status' => 'archived',
        ], $headers),
        'posts-status-422-transition',
    );
});

test('contract: content posts change status not found', function () {
    $headers = actingAsContentOperator();

    ResponseSnapshot::assertMatches(
        $this->postJson('/api/admin/v1/projects/proj-1/content/posts/999/status', [
            'status' => 'published',
        ], $headers),
        'posts-status-404',
    );
});

test('contract: content posts revisions', function () {
    $headers = actingAsContentOperator();

    $post = $this->postJson('/api/admin/v1/projects/proj-1/content/posts', [
        'title' => 'Hello world', 'slug' => 'hello-world', 'body' => 'v1', 'locale' => 'ru',
    ], $headers)->json('data');

    $this->putJson("/api/admin/v1/projects/proj-1/content/posts/{$post['id']}", [
        'title' => 'Hello world', 'slug' => 'hello-world', 'body' => 'v2', 'locale' => 'ru',
    ], $headers);

    ResponseSnapshot::assertMatches(
        $this->getJson("/api/admin/v1/projects/proj-1/content/posts/{$post['id']}/revisions", $headers),
        'posts-revisions',
    );
});

test('contract: content posts revisions not found', function () {
    $headers = actingAsContentOperator();

    ResponseSnapshot::assertMatches(
        $this->getJson('/api/admin/v1/projects/proj-1/content/posts/999/revisions', $headers),
        'posts-revisions-404',
    );
});

test('contract: content posts restore revision', function () {
    $headers = actingAsContentOperator();

    $post = $this->postJson('/api/admin/v1/projects/proj-1/content/posts', [
        'title' => 'Hello world', 'slug' => 'hello-world', 'body' => 'v1', 'locale' => 'ru',
    ], $headers)->json('data');

    $this->putJson("/api/admin/v1/projects/proj-1/content/posts/{$post['id']}", [
        'title' => 'Hello world v2', 'slug' => 'hello-world', 'body' => 'v2', 'locale' => 'ru',
    ], $headers);

    $revisions = $this->getJson("/api/admin/v1/projects/proj-1/content/posts/{$post['id']}/revisions", $headers)
        ->json('data');
    $first = end($revisions);

    ResponseSnapshot::assertMatches(
        $this->postJson(
            "/api/admin/v1/projects/proj-1/content/posts/{$post['id']}/revisions/{$first['id']}/restore",
            [],
            $headers,
        ),
        'posts-restore',
    );
});

test('contract: content posts restore revision not found', function () {
    $headers = actingAsContentOperator();

    $post = $this->postJson('/api/admin/v1/projects/proj-1/content/posts', [
        'title' => 'Hello world', 'slug' => 'hello-world',
    ], $headers)->json('data');

    ResponseSnapshot::assertMatches(
        $this->postJson(
            "/api/admin/v1/projects/proj-1/content/posts/{$post['id']}/revisions/999/restore",
            [],
            $headers,
        ),
        'posts-restore-404',
    );
});

test('contract: content posts unauthenticated', function () {
    actingAsContentOperator();

    ResponseSnapshot::assertMatches(
        $this->getJson('/api/admin/v1/projects/proj-1/content/posts'),
        'posts-index-401',
    );
});

test('contract: content posts publish forbidden', function () {
    $headers = actingAsContentOperator(permissions: ['content.posts.view', 'content.posts.manage']);

    $post = $this->postJson('/api/admin/v1/projects/proj-1/content/posts', [
        'title' => 'Hello world', 'slug' => 'hello-world',
    ], $headers)->json('data');

    // content.posts.publish отсутствует
    ResponseSnapshot::assertMatches(
        $this->postJson("/api/admin/v1/projects/proj-1/content/posts/{$post['id']}/status", [
            'status' => 'published',
        ], $headers),
        'posts-status-403',
    );
});

test('contract: content posts destroy', function () {
    $post = $this->postJson(
        '/api/admin/v1/projects/proj-1/content/posts',
        ['title' => 'Пост под удаление'],
        actingAsContentOperator(),
    )->json('data');

    $response = $this->deleteJson(
        "/api/admin/v1/projects/proj-1/content/posts/{$post['id']}",
        [],
        actingAsContentOperator(),
    );

    ResponseSnapshot::assertMatches($response, 'posts-destroy');
});

test('contract: content posts destroy without the manage permission', function () {
    $post = $this->postJson(
        '/api/admin/v1/projects/proj-1/content/posts',
        ['title' => 'Пост под удаление'],
        actingAsContentOperator(),
    )->json('data');

    $response = $this->deleteJson(
        "/api/admin/v1/projects/proj-1/content/posts/{$post['id']}",
        [],
        actingAsContentOperator('proj-1', ['content.posts.view']),
    );

    ResponseSnapshot::assertMatches($response, 'posts-destroy-403');
});
