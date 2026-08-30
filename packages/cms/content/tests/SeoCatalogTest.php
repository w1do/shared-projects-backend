<?php

declare(strict_types=1);

use Cms\Content\Domain\Models\Category;
use Cms\Content\Domain\Models\Post;
use Cms\Shared\Tenant\ProjectContext;

function seoCatalogUrl(array $query = []): string
{
    $url = '/api/admin/v1/projects/proj-1/content/seo';

    return $query === [] ? $url : $url.'?'.http_build_query($query);
}

test('catalog lists posts, pages and categories of the project with all seo fields', function () {
    $headers = actingAsContentOperator();

    $post = $this->postJson('/api/admin/v1/projects/proj-1/content/posts', ['title' => 'Live post'], $headers)->json('data');
    $this->postJson('/api/admin/v1/projects/proj-1/content/pages', ['title' => 'About', 'slug' => 'about'], $headers)->assertCreated();
    $this->postJson('/api/admin/v1/projects/proj-1/content/categories', ['name' => 'Cars'], $headers)->assertCreated();

    $this->putJson("/api/admin/v1/projects/proj-1/content/seo/post/{$post['id']}", [
        'title' => 'Live post — SEO',
        'description' => 'About the post',
        'keywords' => 'a,b',
        'canonical' => 'https://example.test/live',
        'robots' => 'noindex',
        'og_title' => 'OG',
        'og_description' => 'OG description',
        'og_image' => 'https://example.test/og.png',
        'twitter_card' => 'summary',
        'json_ld' => ['@type' => 'Article'],
    ], $headers)->assertOk();

    $rows = collect($this->getJson(seoCatalogUrl(), $headers)->assertOk()->json('data'));

    expect($rows->pluck('type')->unique()->sort()->values()->all())->toBe(['category', 'page', 'post']);

    $row = $rows->first(fn (array $item): bool => $item['type'] === 'post' && $item['entity_id'] === $post['id']);
    expect($row['filled'])->toBeTrue()
        ->and($row['entity_title'])->toBe('Live post')
        ->and($row['seo'])->toBe([
            'title' => 'Live post — SEO',
            'description' => 'About the post',
            'keywords' => 'a,b',
            'canonical' => 'https://example.test/live',
            'robots' => 'noindex',
            'og_title' => 'OG',
            'og_description' => 'OG description',
            'og_image' => 'https://example.test/og.png',
            'twitter_card' => 'summary',
            'json_ld' => ['@type' => 'Article'],
        ]);
});

test('an entity without seo is present in the catalog and marked as unfilled', function () {
    $headers = actingAsContentOperator();
    $post = $this->postJson('/api/admin/v1/projects/proj-1/content/posts', ['title' => 'Bare'], $headers)->json('data');

    $row = collect($this->getJson(seoCatalogUrl(), $headers)->assertOk()->json('data'))
        ->first(fn (array $item): bool => $item['type'] === 'post' && $item['entity_id'] === $post['id']);

    expect($row['filled'])->toBeFalse()
        ->and($row['seo']['title'])->toBeNull()
        ->and($row['seo']['json_ld'])->toBeNull();
});

test('catalog filters by entity type and sorts by title', function () {
    $headers = actingAsContentOperator();

    $this->postJson('/api/admin/v1/projects/proj-1/content/categories', ['name' => 'Boats'], $headers)->assertCreated();
    $this->postJson('/api/admin/v1/projects/proj-1/content/categories', ['name' => 'Cars'], $headers)->assertCreated();
    $this->postJson('/api/admin/v1/projects/proj-1/content/posts', ['title' => 'A post'], $headers)->assertCreated();

    $rows = collect($this->getJson(seoCatalogUrl([
        'type' => 'category', 'sort' => 'title', 'direction' => 'asc',
    ]), $headers)->assertOk()->json('data'));

    expect($rows->pluck('type')->unique()->all())->toBe(['category'])
        ->and($rows->pluck('entity_title')->all())->toBe(['Boats', 'Cars']);
});

test('catalog holds only the entities of the current project', function () {
    $headers = actingAsContentOperator();
    $this->postJson('/api/admin/v1/projects/proj-1/content/posts', ['title' => 'Mine'], $headers)->assertCreated();

    app(ProjectContext::class)->set('proj-2');
    Post::create(['title' => 'Theirs', 'slug' => 'theirs']);
    Category::create(['name' => 'Their category', 'slug' => 'their-category']);
    app(ProjectContext::class)->clear();

    $titles = collect($this->getJson(seoCatalogUrl(), actingAsContentOperator())->assertOk()->json('data'))
        ->pluck('entity_title');

    expect($titles)->toContain('Mine')->not->toContain('Theirs', 'Their category');
});

test('the second page of the catalog is reachable by cursor', function () {
    $headers = actingAsContentOperator();
    $this->postJson('/api/admin/v1/projects/proj-1/content/posts', ['title' => 'Первый'], $headers)->assertCreated();
    $this->postJson('/api/admin/v1/projects/proj-1/content/posts', ['title' => 'Второй'], $headers)->assertCreated();

    $first = $this->getJson(seoCatalogUrl(['per_page' => 1]), $headers)->assertOk();
    $cursor = $first->json('meta.next_cursor');

    expect($first->json('data'))->toHaveCount(1)
        ->and($cursor)->not->toBeNull();

    $second = $this->getJson(seoCatalogUrl(['per_page' => 1, 'cursor' => $cursor]), $headers)->assertOk();

    expect($second->json('data'))->toHaveCount(1)
        ->and($second->json('data.0.entity_id'))->not->toBe($first->json('data.0.entity_id'));
});

test('catalog requires the seo permission', function () {
    $headers = actingAsContentOperator(permissions: ['content.posts.view']);

    $this->getJson(seoCatalogUrl(), $headers)->assertForbidden();
});

test('catalog is 404 while the content service is disabled', function () {
    $headers = actingAsContentOperator(services: ['pay']);

    $this->getJson(seoCatalogUrl(), $headers)->assertNotFound();
});
