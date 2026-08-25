<?php

declare(strict_types=1);

use Cms\Shared\Testing\ResponseSnapshot;
use Illuminate\Support\Facades\Storage;

/** Характеризационные снимки контракта страниц (routes/admin.php). */
beforeEach(function () {
    Storage::fake('local');
    config(['cms-content.site_url' => 'https://site.test']);
});

test('contract: content pages index', function () {
    $headers = actingAsContentOperator();

    $about = $this->postJson('/api/admin/v1/projects/proj-1/content/pages', [
        'title' => 'About us', 'slug' => 'about-us', 'body' => 'About body', 'locale' => 'ru',
    ], $headers)->json('data');

    $this->postJson('/api/admin/v1/projects/proj-1/content/pages', [
        'title' => 'Secret', 'slug' => 'secret', 'locale' => 'en', 'is_index' => false,
    ], $headers);

    $this->putJson("/api/admin/v1/projects/proj-1/content/seo/page/{$about['id']}", [
        'title' => 'About — seo', 'og_title' => 'About', 'og_image' => 'https://site.test/og.png',
    ], $headers);

    ResponseSnapshot::assertMatches(
        $this->getJson('/api/admin/v1/projects/proj-1/content/pages', $headers),
        'pages-index',
    );
});

test('contract: content pages index empty', function () {
    $headers = actingAsContentOperator();

    ResponseSnapshot::assertMatches(
        $this->getJson('/api/admin/v1/projects/proj-1/content/pages', $headers),
        'pages-index-empty',
    );
});

test('contract: content pages store', function () {
    $headers = actingAsContentOperator();

    ResponseSnapshot::assertMatches(
        $this->postJson('/api/admin/v1/projects/proj-1/content/pages', [
            'title' => 'About us', 'slug' => 'about-us', 'body' => 'About body',
            'locale' => 'ru', 'is_index' => true,
        ], $headers),
        'pages-store',
    );
});

test('contract: content pages store minimal payload', function () {
    $headers = actingAsContentOperator();

    ResponseSnapshot::assertMatches(
        $this->postJson('/api/admin/v1/projects/proj-1/content/pages', [
            'title' => 'About us',
        ], $headers),
        'pages-store-defaults',
    );
});

test('contract: content pages store validation error', function () {
    $headers = actingAsContentOperator();

    ResponseSnapshot::assertMatches(
        $this->postJson('/api/admin/v1/projects/proj-1/content/pages', [
            'title' => '', 'slug' => 'not a slug', 'body' => ['array'],
            'locale' => 'much-too-long-locale', 'is_index' => 'maybe',
        ], $headers),
        'pages-store-422',
    );
});

test('contract: content pages update', function () {
    $headers = actingAsContentOperator();

    $page = $this->postJson('/api/admin/v1/projects/proj-1/content/pages', [
        'title' => 'About us', 'slug' => 'about-us', 'body' => 'v1', 'locale' => 'ru',
    ], $headers)->json('data');

    ResponseSnapshot::assertMatches(
        $this->putJson("/api/admin/v1/projects/proj-1/content/pages/{$page['id']}", [
            'title' => 'About us v2', 'slug' => 'about-us', 'body' => 'v2', 'locale' => 'ru',
        ], $headers),
        'pages-update',
    );
});

test('contract: content pages update validation error', function () {
    $headers = actingAsContentOperator();

    $page = $this->postJson('/api/admin/v1/projects/proj-1/content/pages', [
        'title' => 'About us', 'slug' => 'about-us',
    ], $headers)->json('data');

    ResponseSnapshot::assertMatches(
        $this->putJson("/api/admin/v1/projects/proj-1/content/pages/{$page['id']}", [
            'title' => '',
        ], $headers),
        'pages-update-422',
    );
});

test('contract: content pages update not found', function () {
    $headers = actingAsContentOperator();

    ResponseSnapshot::assertMatches(
        $this->putJson('/api/admin/v1/projects/proj-1/content/pages/999', [
            'title' => 'Ghost',
        ], $headers),
        'pages-update-404',
    );
});

test('contract: content pages change status', function () {
    $headers = actingAsContentOperator();

    $page = $this->postJson('/api/admin/v1/projects/proj-1/content/pages', [
        'title' => 'About us', 'slug' => 'about-us', 'body' => 'About body', 'locale' => 'ru',
    ], $headers)->json('data');

    ResponseSnapshot::assertMatches(
        $this->postJson("/api/admin/v1/projects/proj-1/content/pages/{$page['id']}/status", [
            'status' => 'published',
        ], $headers),
        'pages-status-published',
    );
});

test('contract: content pages change status validation error', function () {
    $headers = actingAsContentOperator();

    $page = $this->postJson('/api/admin/v1/projects/proj-1/content/pages', [
        'title' => 'About us', 'slug' => 'about-us',
    ], $headers)->json('data');

    ResponseSnapshot::assertMatches(
        $this->postJson("/api/admin/v1/projects/proj-1/content/pages/{$page['id']}/status", [
            'status' => 'nonsense',
        ], $headers),
        'pages-status-422',
    );
});

test('contract: content pages change status forbidden transition', function () {
    $headers = actingAsContentOperator();

    $page = $this->postJson('/api/admin/v1/projects/proj-1/content/pages', [
        'title' => 'About us', 'slug' => 'about-us',
    ], $headers)->json('data');

    ResponseSnapshot::assertMatches(
        $this->postJson("/api/admin/v1/projects/proj-1/content/pages/{$page['id']}/status", [
            'status' => 'archived',
        ], $headers),
        'pages-status-422-transition',
    );
});

test('contract: content pages change status not found', function () {
    $headers = actingAsContentOperator();

    ResponseSnapshot::assertMatches(
        $this->postJson('/api/admin/v1/projects/proj-1/content/pages/999/status', [
            'status' => 'published',
        ], $headers),
        'pages-status-404',
    );
});

test('contract: content pages revisions', function () {
    $headers = actingAsContentOperator();

    $page = $this->postJson('/api/admin/v1/projects/proj-1/content/pages', [
        'title' => 'About us', 'slug' => 'about-us', 'body' => 'v1', 'locale' => 'ru',
    ], $headers)->json('data');

    $this->putJson("/api/admin/v1/projects/proj-1/content/pages/{$page['id']}", [
        'title' => 'About us', 'slug' => 'about-us', 'body' => 'v2', 'locale' => 'ru',
    ], $headers);

    ResponseSnapshot::assertMatches(
        $this->getJson("/api/admin/v1/projects/proj-1/content/pages/{$page['id']}/revisions", $headers),
        'pages-revisions',
    );
});

test('contract: content pages revisions not found', function () {
    $headers = actingAsContentOperator();

    ResponseSnapshot::assertMatches(
        $this->getJson('/api/admin/v1/projects/proj-1/content/pages/999/revisions', $headers),
        'pages-revisions-404',
    );
});

test('contract: content pages restore revision', function () {
    $headers = actingAsContentOperator();

    $page = $this->postJson('/api/admin/v1/projects/proj-1/content/pages', [
        'title' => 'About us', 'slug' => 'about-us', 'body' => 'v1', 'locale' => 'ru',
    ], $headers)->json('data');

    $this->putJson("/api/admin/v1/projects/proj-1/content/pages/{$page['id']}", [
        'title' => 'About us v2', 'slug' => 'about-us', 'body' => 'v2', 'locale' => 'ru',
    ], $headers);

    $revisions = $this->getJson("/api/admin/v1/projects/proj-1/content/pages/{$page['id']}/revisions", $headers)
        ->json('data');
    $first = end($revisions);

    ResponseSnapshot::assertMatches(
        $this->postJson(
            "/api/admin/v1/projects/proj-1/content/pages/{$page['id']}/revisions/{$first['id']}/restore",
            [],
            $headers,
        ),
        'pages-restore',
    );
});

test('contract: content pages restore revision not found', function () {
    $headers = actingAsContentOperator();

    $page = $this->postJson('/api/admin/v1/projects/proj-1/content/pages', [
        'title' => 'About us', 'slug' => 'about-us',
    ], $headers)->json('data');

    ResponseSnapshot::assertMatches(
        $this->postJson(
            "/api/admin/v1/projects/proj-1/content/pages/{$page['id']}/revisions/999/restore",
            [],
            $headers,
        ),
        'pages-restore-404',
    );
});

test('contract: content pages unauthenticated', function () {
    actingAsContentOperator();

    ResponseSnapshot::assertMatches(
        $this->getJson('/api/admin/v1/projects/proj-1/content/pages'),
        'pages-index-401',
    );
});

test('contract: content pages forbidden', function () {
    $headers = actingAsContentOperator(permissions: ['content.pages.view']);

    ResponseSnapshot::assertMatches(
        $this->postJson('/api/admin/v1/projects/proj-1/content/pages', [
            'title' => 'About us',
        ], $headers),
        'pages-store-403',
    );
});
