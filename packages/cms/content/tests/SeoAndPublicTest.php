<?php

declare(strict_types=1);

use Cms\Content\Infrastructure\Jobs\GenerateMediaVariantsJob;
use Cms\Content\Infrastructure\Support\RobotsGenerator;
use Cms\Content\Infrastructure\Support\SitemapGenerator;
use Cms\Shared\Analytics\AnalyticsRecorder;
use Cms\Shared\Analytics\SendAnalyticsEventJob;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Http\Testing\File;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;

function makePublishedPost(array $headers, array $attrs = []): array
{
    $post = test()->postJson('/api/admin/v1/projects/proj-1/content/posts', $attrs + ['title' => 'P'.uniqid()], $headers)->json('data');
    test()->postJson("/api/admin/v1/projects/proj-1/content/posts/{$post['id']}/status", ['status' => 'published'], $headers)->assertOk();

    return $post;
}

test('polymorphic seo with json-ld attaches to category and is returned publicly', function () {
    $headers = actingAsContentOperator();

    $cat = $this->postJson('/api/admin/v1/projects/proj-1/content/categories', ['name' => 'Cars'], $headers)->json('data');

    $this->putJson("/api/admin/v1/projects/proj-1/content/seo/category/{$cat['id']}", [
        'title' => 'Cars — catalog',
        'description' => 'All cars',
        'og_title' => 'Cars',
        'json_ld' => ['@context' => 'https://schema.org', '@type' => 'CollectionPage', 'name' => 'Cars'],
    ], $headers)->assertOk();

    $tree = $this->getJson('/api/v1/content/categories', actingAsProjectSite())->assertOk()->json('data');

    expect($tree[0]['seo']['title'])->toBe('Cars — catalog')
        ->and($tree[0]['seo']['json_ld']['@type'])->toBe('CollectionPage');
});

test('invalid json-ld payload is rejected with 422', function () {
    $headers = actingAsContentOperator();
    $cat = $this->postJson('/api/admin/v1/projects/proj-1/content/categories', ['name' => 'X'], $headers)->json('data');

    $this->putJson("/api/admin/v1/projects/proj-1/content/seo/category/{$cat['id']}", [
        'json_ld' => 'not-a-json-object',
    ], $headers)->assertStatus(422);
});

test('public api returns only published posts and honours cache purge', function () {
    $headers = actingAsContentOperator();
    $site = actingAsProjectSite();

    $this->postJson('/api/admin/v1/projects/proj-1/content/posts', ['title' => 'Draft only'], $headers)->assertCreated();
    $published = makePublishedPost($headers, ['title' => 'Live post']);

    $list = $this->getJson('/api/v1/content/posts', $site)->assertOk()->json('data');
    expect(collect($list)->pluck('title'))->toContain('Live post')->not->toContain('Draft only');

    // Одиночный по slug
    $this->getJson("/api/v1/content/posts/{$published['slug']}", $site)->assertOk()
        ->assertJsonPath('data.title', 'Live post');

    // Черновик по slug — 404
    $this->getJson('/api/v1/content/posts/draft-only', $site)->assertNotFound();

    // Публикация нового поста сбрасывает кэш списка
    makePublishedPost($headers, ['title' => 'Second live']);
    $list2 = $this->getJson('/api/v1/content/posts', $site)->assertOk()->json('data');
    expect(collect($list2)->pluck('title'))->toContain('Second live');
});

test('public posts filter by category includes descendants', function () {
    $headers = actingAsContentOperator();
    $site = actingAsProjectSite();

    $parent = $this->postJson('/api/admin/v1/projects/proj-1/content/categories', ['name' => 'Root'], $headers)->json('data');
    $child = $this->postJson('/api/admin/v1/projects/proj-1/content/categories', ['name' => 'Leaf', 'parent_id' => $parent['id']], $headers)->json('data');

    makePublishedPost($headers, ['title' => 'In leaf', 'categories' => [$child['id']]]);
    makePublishedPost($headers, ['title' => 'Elsewhere']);

    $list = $this->getJson("/api/v1/content/posts?category={$parent['id']}", $site)->assertOk()->json('data');
    expect(collect($list)->pluck('title'))->toContain('In leaf')->not->toContain('Elsewhere');
});

test('pages are served by slug when published', function () {
    $headers = actingAsContentOperator();
    $site = actingAsProjectSite();

    $page = $this->postJson('/api/admin/v1/projects/proj-1/content/pages', ['title' => 'About us'], $headers)->json('data');
    $this->getJson('/api/v1/content/pages/about-us', $site)->assertNotFound();

    $this->postJson("/api/admin/v1/projects/proj-1/content/pages/{$page['id']}/status", ['status' => 'published'], $headers)->assertOk();
    $this->getJson('/api/v1/content/pages/about-us', $site)->assertOk()->assertJsonPath('data.title', 'About us');
});

test('sitemap includes published is_index content and excludes noindex', function () {
    $headers = actingAsContentOperator();
    app(ProjectContext::class)->set('proj-1');

    $visible = makePublishedPost($headers, ['title' => 'Visible post']);
    $hidden = makePublishedPost($headers, ['title' => 'Hidden post', 'is_index' => false]);
    $noindexed = makePublishedPost($headers, ['title' => 'Noindexed post']);
    $this->putJson("/api/admin/v1/projects/proj-1/content/seo/post/{$noindexed['id']}", ['robots' => 'noindex,nofollow'], $headers)->assertOk();

    $xml = app(SitemapGenerator::class)->generate('proj-1');

    expect($xml)->toContain($visible['slug'])
        ->not->toContain($hidden['slug'])
        ->not->toContain($noindexed['slug']);

    // Публичный маршрут отдаёт xml
    $this->get('/sitemap.xml', actingAsProjectSite())->assertOk()->assertHeader('Content-Type', 'application/xml');
});

test('robots.txt contains project rules and sitemap link', function () {
    $headers = actingAsContentOperator();
    app(ProjectContext::class)->set('proj-1');

    $page = $this->postJson('/api/admin/v1/projects/proj-1/content/pages', ['title' => 'Secret', 'is_index' => false], $headers)->json('data');

    $robots = app(RobotsGenerator::class)->generate('proj-1');

    expect($robots)->toContain('User-agent: *')
        ->toContain('Disallow: /secret')
        ->toContain('Sitemap:');

    $this->get('/robots.txt', actingAsProjectSite())->assertOk()->assertSee('User-agent');
});

test('media upload responds immediately and defers variants to the media queue', function () {
    Queue::fake([GenerateMediaVariantsJob::class]);
    Storage::fake('s3');
    config(['cms-content.media_disk' => 's3']);

    $headers = actingAsContentOperator();

    $this->post('/api/admin/v1/projects/proj-1/content/media', [
        'file' => File::image('photo.jpg', 100, 100),
        'alt' => 'Фото',
    ], $headers)->assertCreated();

    Queue::assertPushedOn('media', GenerateMediaVariantsJob::class);
});

test('publishing a post pushes an analytics event', function () {
    config(['cms.analytics_url' => 'http://analytics-service:8000']);
    app()->forgetInstance(AnalyticsRecorder::class);
    Bus::fake([SendAnalyticsEventJob::class]);

    $headers = actingAsContentOperator();
    makePublishedPost($headers, ['title' => 'Tracked']);

    Bus::assertDispatched(
        SendAnalyticsEventJob::class,
        fn ($job) => $job->event['name'] === 'content.post.published' && $job->event['project_id'] === 'proj-1',
    );
});
