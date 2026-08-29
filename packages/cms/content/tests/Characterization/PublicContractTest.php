<?php

declare(strict_types=1);

use Cms\Content\Domain\Models\MediaFile;
use Cms\Content\Domain\Models\Post;
use Cms\Shared\Tenant\ProjectContext;
use Cms\Shared\Testing\ResponseSnapshot;
use Illuminate\Support\Facades\Storage;

/**
 * Характеризационные снимки публичного контракта (routes/public.php),
 * включая не-JSON ответы sitemap.xml и robots.txt.
 */
beforeEach(function () {
    Storage::fake('local');
    // site_url фиксируется явно: иначе базовый URL берётся из окружения
    config(['cms-content.site_url' => 'https://site.test']);
});

/** Опубликованный пост с полностью зафиксированными атрибутами. */
function contractPublishedPost(array $attributes): Post
{
    return Post::factory()->create($attributes + [
        'title' => 'Fixed title',
        'slug' => 'fixed-title',
        'body' => 'Fixed body',
        'locale' => 'ru',
        'status' => 'published',
        'published_at' => '2024-01-01 00:00:00',
        'is_index' => true,
    ]);
}

test('contract: content public posts', function () {
    $headers = actingAsContentOperator();

    $category = $this->postJson('/api/admin/v1/projects/proj-1/content/categories', [
        'name' => 'News', 'slug' => 'news',
    ], $headers)->json('data');

    $post = $this->postJson('/api/admin/v1/projects/proj-1/content/posts', [
        'title' => 'Live post', 'slug' => 'live-post', 'body' => 'Live body',
        'locale' => 'ru', 'categories' => [$category['id']],
    ], $headers)->json('data');

    $this->postJson("/api/admin/v1/projects/proj-1/content/posts/{$post['id']}/status", [
        'status' => 'published',
    ], $headers)->assertOk();

    $this->putJson("/api/admin/v1/projects/proj-1/content/seo/post/{$post['id']}", [
        'title' => 'Live post — seo', 'robots' => 'index,follow',
    ], $headers)->assertOk();

    // Черновик в публичный список не попадает
    $this->postJson('/api/admin/v1/projects/proj-1/content/posts', [
        'title' => 'Draft post', 'slug' => 'draft-post', 'locale' => 'ru',
    ], $headers)->assertCreated();

    $site = actingAsProjectSite();

    ResponseSnapshot::assertMatches(
        $this->getJson('/api/v1/content/posts', $site),
        'public-posts',
    );

    ResponseSnapshot::assertMatches(
        $this->getJson("/api/v1/content/posts?category={$category['id']}", $site),
        'public-posts-by-category',
    );

    ResponseSnapshot::assertMatches(
        $this->getJson('/api/v1/content/posts?locale=en', $site),
        'public-posts-empty-locale',
    );
});

test('contract: content public posts cursor pagination', function () {
    actingAsContentOperator();
    app(ProjectContext::class)->set('proj-1');

    foreach (range(1, 26) as $n) {
        $number = str_pad((string) $n, 2, '0', STR_PAD_LEFT);
        contractPublishedPost([
            'title' => "Post {$number}",
            'slug' => "post-{$number}",
            'body' => "Body {$number}",
        ]);
    }

    $site = actingAsProjectSite();

    $first = $this->getJson('/api/v1/content/posts', $site);
    ResponseSnapshot::assertMatches($first, 'public-posts-cursor-first-page');

    expect($first->json('meta.per_page'))->toBe(25)
        ->and($first->json('data'))->toHaveCount(25)
        ->and($first->json('meta.prev_cursor'))->toBeNull();

    $cursor = $first->json('meta.next_cursor');
    expect($cursor)->toBeString();

    ResponseSnapshot::assertMatches(
        $this->getJson('/api/v1/content/posts?cursor='.urlencode($cursor), $site),
        'public-posts-cursor-second-page',
    );
});

test('contract: content public post by slug', function () {
    $headers = actingAsContentOperator();

    $post = $this->postJson('/api/admin/v1/projects/proj-1/content/posts', [
        'title' => 'Live post', 'slug' => 'live-post', 'body' => 'Live body', 'locale' => 'ru',
    ], $headers)->json('data');

    $this->postJson("/api/admin/v1/projects/proj-1/content/posts/{$post['id']}/status", [
        'status' => 'published',
    ], $headers)->assertOk();

    $site = actingAsProjectSite();

    ResponseSnapshot::assertMatches(
        $this->getJson('/api/v1/content/posts/live-post', $site),
        'public-post',
    );
});

test('contract: content public post by slug not found', function () {
    $headers = actingAsContentOperator();

    $this->postJson('/api/admin/v1/projects/proj-1/content/posts', [
        'title' => 'Draft post', 'slug' => 'draft-post', 'locale' => 'ru',
    ], $headers)->assertCreated();

    $site = actingAsProjectSite();

    // черновик по slug недоступен публично
    ResponseSnapshot::assertMatches(
        $this->getJson('/api/v1/content/posts/draft-post', $site),
        'public-post-404',
    );
});

test('contract: content public page by slug', function () {
    $headers = actingAsContentOperator();

    $page = $this->postJson('/api/admin/v1/projects/proj-1/content/pages', [
        'title' => 'About us', 'slug' => 'about-us', 'body' => 'About body', 'locale' => 'ru',
    ], $headers)->json('data');

    $this->putJson("/api/admin/v1/projects/proj-1/content/seo/page/{$page['id']}", [
        'title' => 'About — seo',
    ], $headers)->assertOk();

    $this->postJson("/api/admin/v1/projects/proj-1/content/pages/{$page['id']}/status", [
        'status' => 'published',
    ], $headers)->assertOk();

    $site = actingAsProjectSite();

    ResponseSnapshot::assertMatches(
        $this->getJson('/api/v1/content/pages/about-us', $site),
        'public-page',
    );
});

test('contract: content public page by slug not found', function () {
    $headers = actingAsContentOperator();

    $this->postJson('/api/admin/v1/projects/proj-1/content/pages', [
        'title' => 'About us', 'slug' => 'about-us',
    ], $headers)->assertCreated();

    $site = actingAsProjectSite();

    ResponseSnapshot::assertMatches(
        $this->getJson('/api/v1/content/pages/about-us', $site),
        'public-page-404',
    );
});

test('contract: content public categories', function () {
    $headers = actingAsContentOperator();

    $root = $this->postJson('/api/admin/v1/projects/proj-1/content/categories', [
        'name' => 'News', 'slug' => 'news',
    ], $headers)->json('data');

    $this->postJson('/api/admin/v1/projects/proj-1/content/categories', [
        'name' => 'Sport', 'slug' => 'sport', 'parent_id' => $root['id'],
    ], $headers)->assertCreated();

    $this->putJson("/api/admin/v1/projects/proj-1/content/seo/category/{$root['id']}", [
        'title' => 'News — catalog',
        'json_ld' => ['@context' => 'https://schema.org', '@type' => 'CollectionPage'],
    ], $headers)->assertOk();

    $site = actingAsProjectSite();

    ResponseSnapshot::assertMatches(
        $this->getJson('/api/v1/content/categories', $site),
        'public-categories',
    );
});

test('contract: content public categories empty', function () {
    $site = actingAsProjectSite();

    ResponseSnapshot::assertMatches(
        $this->getJson('/api/v1/content/categories', $site),
        'public-categories-empty',
    );
});

test('contract: content public without api key', function () {
    actingAsProjectSite();

    ResponseSnapshot::assertMatches(
        $this->getJson('/api/v1/content/posts'),
        'public-posts-401',
    );
});

test('contract: content public service disabled', function () {
    $site = actingAsProjectSite(services: []);

    ResponseSnapshot::assertMatches(
        $this->getJson('/api/v1/content/posts', $site),
        'public-posts-service-disabled-404',
    );
});

test('contract: content sitemap xml', function () {
    $headers = actingAsContentOperator();

    $post = $this->postJson('/api/admin/v1/projects/proj-1/content/posts', [
        'title' => 'Live post', 'slug' => 'live-post', 'locale' => 'ru',
    ], $headers)->json('data');
    $this->postJson("/api/admin/v1/projects/proj-1/content/posts/{$post['id']}/status", [
        'status' => 'published',
    ], $headers)->assertOk();

    $page = $this->postJson('/api/admin/v1/projects/proj-1/content/pages', [
        'title' => 'About us', 'slug' => 'about-us',
    ], $headers)->json('data');
    $this->postJson("/api/admin/v1/projects/proj-1/content/pages/{$page['id']}/status", [
        'status' => 'published',
    ], $headers)->assertOk();

    $this->postJson('/api/admin/v1/projects/proj-1/content/categories', [
        'name' => 'News', 'slug' => 'news',
    ], $headers)->assertCreated();

    // закрытый от индексации пост в sitemap не попадает
    $hidden = $this->postJson('/api/admin/v1/projects/proj-1/content/posts', [
        'title' => 'Hidden post', 'slug' => 'hidden-post', 'locale' => 'ru', 'is_index' => false,
    ], $headers)->json('data');
    $this->postJson("/api/admin/v1/projects/proj-1/content/posts/{$hidden['id']}/status", [
        'status' => 'published',
    ], $headers)->assertOk();

    $site = actingAsProjectSite();

    ResponseSnapshot::assertMatches($this->get('/sitemap.xml', $site), 'sitemap-xml');
});

test('contract: content sitemap xml empty', function () {
    $site = actingAsProjectSite();

    ResponseSnapshot::assertMatches($this->get('/sitemap.xml', $site), 'sitemap-xml-empty');
});

test('contract: content robots txt', function () {
    $headers = actingAsContentOperator();

    $this->postJson('/api/admin/v1/projects/proj-1/content/pages', [
        'title' => 'Secret', 'slug' => 'secret', 'is_index' => false,
    ], $headers)->assertCreated();

    $this->postJson('/api/admin/v1/projects/proj-1/content/categories', [
        'name' => 'Hidden', 'slug' => 'hidden', 'is_index' => false,
    ], $headers)->assertCreated();

    $site = actingAsProjectSite();

    ResponseSnapshot::assertMatches($this->get('/robots.txt', $site), 'robots-txt');
});

test('contract: content robots txt without api key', function () {
    actingAsProjectSite();

    ResponseSnapshot::assertMatches($this->get('/robots.txt'), 'robots-txt-401');
});

test('contract: content public post with images', function () {
    Storage::fake('s3');
    config(['cms-content.media_disk' => 's3']);

    $headers = actingAsContentOperator();
    app(ProjectContext::class)->set('proj-1');

    $cover = MediaFile::create([
        'disk' => 's3', 'path' => 'projects/proj-1/media/cover.jpg',
        'mime' => 'image/jpeg', 'size' => 1024, 'alt' => 'Cover alt',
    ]);

    $post = $this->postJson('/api/admin/v1/projects/proj-1/content/posts', [
        'title' => 'Illustrated post', 'slug' => 'illustrated-post', 'body' => 'Body',
        'locale' => 'ru', 'cover_media_id' => $cover->id,
    ], $headers)->json('data');

    $this->postJson("/api/admin/v1/projects/proj-1/content/posts/{$post['id']}/status", [
        'status' => 'published',
    ], $headers)->assertOk();

    ResponseSnapshot::assertMatches(
        $this->getJson('/api/v1/content/posts/illustrated-post', actingAsProjectSite()),
        'public-post-with-images',
    );
});
