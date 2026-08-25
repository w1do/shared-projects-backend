<?php

declare(strict_types=1);

use Cms\Shared\Testing\ResponseSnapshot;
use Illuminate\Support\Facades\Storage;

/** Характеризационные снимки полиморфного SEO-контракта (routes/admin.php). */
beforeEach(function () {
    Storage::fake('local');
    config(['cms-content.site_url' => 'https://site.test']);
});

/** Категория с зафиксированными атрибутами; возвращает её id. */
function contractSeoCategory(array $headers): int
{
    return (int) test()->postJson('/api/admin/v1/projects/proj-1/content/categories', [
        'name' => 'News', 'slug' => 'news',
    ], $headers)->json('data.id');
}

test('contract: content seo update', function () {
    $headers = actingAsContentOperator();
    $categoryId = contractSeoCategory($headers);

    ResponseSnapshot::assertMatches(
        $this->putJson("/api/admin/v1/projects/proj-1/content/seo/category/{$categoryId}", [
            'title' => 'News — catalog',
            'description' => 'All the news',
            'keywords' => 'news, daily',
            'canonical' => 'https://site.test/news',
            'robots' => 'index,follow',
            'og_title' => 'News',
            'og_description' => 'News description',
            'og_image' => 'https://site.test/og.png',
            'twitter_card' => 'summary_large_image',
            'json_ld' => ['@context' => 'https://schema.org', '@type' => 'CollectionPage', 'name' => 'News'],
        ], $headers),
        'seo-update',
    );
});

test('contract: content seo update empty payload', function () {
    $headers = actingAsContentOperator();
    $categoryId = contractSeoCategory($headers);

    ResponseSnapshot::assertMatches(
        $this->putJson("/api/admin/v1/projects/proj-1/content/seo/category/{$categoryId}", [], $headers),
        'seo-update-empty',
    );
});

test('contract: content seo update validation error', function () {
    $headers = actingAsContentOperator();
    $categoryId = contractSeoCategory($headers);

    ResponseSnapshot::assertMatches(
        $this->putJson("/api/admin/v1/projects/proj-1/content/seo/category/{$categoryId}", [
            'title' => str_repeat('t', 256),
            'description' => str_repeat('d', 501),
            'keywords' => str_repeat('k', 501),
            'canonical' => 'not-a-url',
            'robots' => str_repeat('r', 65),
            'twitter_card' => str_repeat('c', 33),
            'json_ld' => 'not-a-json-object',
        ], $headers),
        'seo-update-422',
    );
});

test('contract: content seo update not found', function () {
    $headers = actingAsContentOperator();

    ResponseSnapshot::assertMatches(
        $this->putJson('/api/admin/v1/projects/proj-1/content/seo/category/999', [
            'title' => 'Ghost',
        ], $headers),
        'seo-update-404',
    );
});

test('contract: content seo update unknown type', function () {
    $headers = actingAsContentOperator();

    ResponseSnapshot::assertMatches(
        $this->putJson('/api/admin/v1/projects/proj-1/content/seo/widget/1', [
            'title' => 'Ghost',
        ], $headers),
        'seo-update-404-unknown-type',
    );
});

test('contract: content seo show', function () {
    $headers = actingAsContentOperator();
    $categoryId = contractSeoCategory($headers);

    $this->putJson("/api/admin/v1/projects/proj-1/content/seo/category/{$categoryId}", [
        'title' => 'News — catalog',
        'description' => 'All the news',
        'robots' => 'index,follow',
        'json_ld' => ['@context' => 'https://schema.org', '@type' => 'CollectionPage'],
    ], $headers);

    ResponseSnapshot::assertMatches(
        $this->getJson("/api/admin/v1/projects/proj-1/content/seo/category/{$categoryId}", $headers),
        'seo-show',
    );
});

test('contract: content seo show without meta', function () {
    $headers = actingAsContentOperator();
    $categoryId = contractSeoCategory($headers);

    ResponseSnapshot::assertMatches(
        $this->getJson("/api/admin/v1/projects/proj-1/content/seo/category/{$categoryId}", $headers),
        'seo-show-null',
    );
});

test('contract: content seo show for post and page', function () {
    $headers = actingAsContentOperator();

    $post = $this->postJson('/api/admin/v1/projects/proj-1/content/posts', [
        'title' => 'Hello world', 'slug' => 'hello-world',
    ], $headers)->json('data');
    $page = $this->postJson('/api/admin/v1/projects/proj-1/content/pages', [
        'title' => 'About us', 'slug' => 'about-us',
    ], $headers)->json('data');

    $this->putJson("/api/admin/v1/projects/proj-1/content/seo/post/{$post['id']}", [
        'title' => 'Post seo',
    ], $headers);
    $this->putJson("/api/admin/v1/projects/proj-1/content/seo/page/{$page['id']}", [
        'title' => 'Page seo',
    ], $headers);

    ResponseSnapshot::assertMatches(
        $this->getJson("/api/admin/v1/projects/proj-1/content/seo/post/{$post['id']}", $headers),
        'seo-show-post',
    );
    ResponseSnapshot::assertMatches(
        $this->getJson("/api/admin/v1/projects/proj-1/content/seo/page/{$page['id']}", $headers),
        'seo-show-page',
    );
});

test('contract: content seo show not found', function () {
    $headers = actingAsContentOperator();

    ResponseSnapshot::assertMatches(
        $this->getJson('/api/admin/v1/projects/proj-1/content/seo/post/999', $headers),
        'seo-show-404',
    );
});

test('contract: content seo unauthenticated', function () {
    actingAsContentOperator();

    ResponseSnapshot::assertMatches(
        $this->getJson('/api/admin/v1/projects/proj-1/content/seo/post/1'),
        'seo-show-401',
    );
});

test('contract: content seo forbidden', function () {
    $headers = actingAsContentOperator(permissions: ['content.posts.view']);

    ResponseSnapshot::assertMatches(
        $this->getJson('/api/admin/v1/projects/proj-1/content/seo/post/1', $headers),
        'seo-show-403',
    );
});
