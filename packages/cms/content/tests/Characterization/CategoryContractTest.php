<?php

declare(strict_types=1);

use Cms\Shared\Testing\ResponseSnapshot;
use Illuminate\Support\Facades\Storage;

/**
 * Характеризационные снимки контракта категорий (routes/admin.php).
 * Фиксируют текущий формат ответов до рефакторинга: любые изменения
 * конверта, ключей, типов, кодов ошибок и текстов сообщений красят тест.
 */
beforeEach(function () {
    // sitemap регенерируется синхронной джобой и пишется на диск local:
    // без изоляции артефакт прошлого прогона делает ответы недетерминированными
    Storage::fake('local');
    config(['cms-content.site_url' => 'https://site.test']);
});

test('contract: content categories index', function () {
    $headers = actingAsContentOperator();

    $root = $this->postJson('/api/admin/v1/projects/proj-1/content/categories', [
        'name' => 'News', 'slug' => 'news', 'is_index' => true,
    ], $headers)->json('data');

    $this->postJson('/api/admin/v1/projects/proj-1/content/categories', [
        'name' => 'Sport', 'slug' => 'sport', 'parent_id' => $root['id'], 'is_index' => false,
    ], $headers);

    $this->putJson("/api/admin/v1/projects/proj-1/content/seo/category/{$root['id']}", [
        'title' => 'News — index',
        'description' => 'All news',
        'robots' => 'index,follow',
        'json_ld' => ['@context' => 'https://schema.org', '@type' => 'CollectionPage'],
    ], $headers);

    ResponseSnapshot::assertMatches(
        $this->getJson('/api/admin/v1/projects/proj-1/content/categories', $headers),
        'categories-index',
    );
});

test('contract: content categories index empty', function () {
    $headers = actingAsContentOperator();

    ResponseSnapshot::assertMatches(
        $this->getJson('/api/admin/v1/projects/proj-1/content/categories', $headers),
        'categories-index-empty',
    );
});

test('contract: content categories store', function () {
    $headers = actingAsContentOperator();

    ResponseSnapshot::assertMatches(
        $this->postJson('/api/admin/v1/projects/proj-1/content/categories', [
            'name' => 'News', 'slug' => 'news', 'is_index' => true,
        ], $headers),
        'categories-store',
    );
});

test('contract: content categories store with translations', function () {
    $headers = actingAsContentOperator();

    ResponseSnapshot::assertMatches(
        $this->postJson('/api/admin/v1/projects/proj-1/content/categories', [
            'name' => ['en' => 'News', 'ru' => 'Новости'], 'slug' => 'news',
        ], $headers),
        'categories-store-translated',
    );
});

test('contract: content categories store validation error', function () {
    $headers = actingAsContentOperator();

    $response = $this->postJson('/api/admin/v1/projects/proj-1/content/categories', [
        'name' => '', 'slug' => 'not a slug', 'parent_id' => 'abc', 'is_index' => 'maybe',
    ], $headers);

    ResponseSnapshot::assertMatches($response, 'categories-store-422');

    // Снимок маскирует значения ключей *_id — литерал фиксируется отдельно
    $response->assertJsonPath('error.details.parent_id.0', 'The parent id field must be an integer.');
});

test('contract: content categories update', function () {
    $headers = actingAsContentOperator();

    $category = $this->postJson('/api/admin/v1/projects/proj-1/content/categories', [
        'name' => 'News', 'slug' => 'news',
    ], $headers)->json('data');

    ResponseSnapshot::assertMatches(
        $this->putJson("/api/admin/v1/projects/proj-1/content/categories/{$category['id']}", [
            'name' => 'Fresh news', 'slug' => 'fresh-news', 'is_index' => false,
        ], $headers),
        'categories-update',
    );
});

test('contract: content categories update validation error', function () {
    $headers = actingAsContentOperator();

    $category = $this->postJson('/api/admin/v1/projects/proj-1/content/categories', [
        'name' => 'News', 'slug' => 'news',
    ], $headers)->json('data');

    ResponseSnapshot::assertMatches(
        $this->putJson("/api/admin/v1/projects/proj-1/content/categories/{$category['id']}", [
            'slug' => 'not a slug',
        ], $headers),
        'categories-update-422',
    );
});

test('contract: content categories update not found', function () {
    $headers = actingAsContentOperator();

    ResponseSnapshot::assertMatches(
        $this->putJson('/api/admin/v1/projects/proj-1/content/categories/999', [
            'name' => 'Ghost',
        ], $headers),
        'categories-update-404',
    );
});

test('contract: content categories move', function () {
    $headers = actingAsContentOperator();

    $target = $this->postJson('/api/admin/v1/projects/proj-1/content/categories', [
        'name' => 'Target', 'slug' => 'target',
    ], $headers)->json('data');
    $moved = $this->postJson('/api/admin/v1/projects/proj-1/content/categories', [
        'name' => 'Moved', 'slug' => 'moved',
    ], $headers)->json('data');

    ResponseSnapshot::assertMatches(
        $this->postJson("/api/admin/v1/projects/proj-1/content/categories/{$moved['id']}/move", [
            'parent_id' => $target['id'],
        ], $headers),
        'categories-move',
    );
});

test('contract: content categories move to root with position', function () {
    $headers = actingAsContentOperator();

    $first = $this->postJson('/api/admin/v1/projects/proj-1/content/categories', [
        'name' => 'First', 'slug' => 'first',
    ], $headers)->json('data');
    $second = $this->postJson('/api/admin/v1/projects/proj-1/content/categories', [
        'name' => 'Second', 'slug' => 'second',
    ], $headers)->json('data');

    expect($first['id'])->toBeInt();

    ResponseSnapshot::assertMatches(
        $this->postJson("/api/admin/v1/projects/proj-1/content/categories/{$second['id']}/move", [
            'parent_id' => null, 'position' => 0,
        ], $headers),
        'categories-move-root',
    );
});

test('contract: content categories move validation error', function () {
    $headers = actingAsContentOperator();

    $category = $this->postJson('/api/admin/v1/projects/proj-1/content/categories', [
        'name' => 'News', 'slug' => 'news',
    ], $headers)->json('data');

    $response = $this->postJson("/api/admin/v1/projects/proj-1/content/categories/{$category['id']}/move", [
        'parent_id' => 'abc', 'position' => -1,
    ], $headers);

    ResponseSnapshot::assertMatches($response, 'categories-move-422');

    $response->assertJsonPath('error.details.parent_id.0', 'The parent id field must be an integer.');
});

test('contract: content categories move under own descendant', function () {
    $headers = actingAsContentOperator();

    $root = $this->postJson('/api/admin/v1/projects/proj-1/content/categories', [
        'name' => 'Root', 'slug' => 'root',
    ], $headers)->json('data');
    $child = $this->postJson('/api/admin/v1/projects/proj-1/content/categories', [
        'name' => 'Child', 'slug' => 'child', 'parent_id' => $root['id'],
    ], $headers)->json('data');

    $response = $this->postJson("/api/admin/v1/projects/proj-1/content/categories/{$root['id']}/move", [
        'parent_id' => $child['id'],
    ], $headers);

    ResponseSnapshot::assertMatches($response, 'categories-move-422-descendant');

    // 422 из MoveCategoryHandler: текст сообщения снимок маскирует (ключ *_id)
    $response->assertJsonPath('error.details.parent_id.0', 'Cannot move a node under its own descendant.');
});

test('contract: content categories move to missing parent', function () {
    $headers = actingAsContentOperator();

    $category = $this->postJson('/api/admin/v1/projects/proj-1/content/categories', [
        'name' => 'News', 'slug' => 'news',
    ], $headers)->json('data');

    ResponseSnapshot::assertMatches(
        $this->postJson("/api/admin/v1/projects/proj-1/content/categories/{$category['id']}/move", [
            'parent_id' => 999,
        ], $headers),
        'categories-move-404-parent',
    );
});

test('contract: content categories move not found', function () {
    $headers = actingAsContentOperator();

    ResponseSnapshot::assertMatches(
        $this->postJson('/api/admin/v1/projects/proj-1/content/categories/999/move', [
            'parent_id' => null,
        ], $headers),
        'categories-move-404',
    );
});

test('contract: content categories destroy', function () {
    $headers = actingAsContentOperator();

    $category = $this->postJson('/api/admin/v1/projects/proj-1/content/categories', [
        'name' => 'News', 'slug' => 'news',
    ], $headers)->json('data');

    ResponseSnapshot::assertMatches(
        $this->deleteJson("/api/admin/v1/projects/proj-1/content/categories/{$category['id']}", [], $headers),
        'categories-destroy-204',
    );
});

test('contract: content categories destroy not found', function () {
    $headers = actingAsContentOperator();

    ResponseSnapshot::assertMatches(
        $this->deleteJson('/api/admin/v1/projects/proj-1/content/categories/999', [], $headers),
        'categories-destroy-404',
    );
});

test('contract: content categories bulk delete', function () {
    $headers = actingAsContentOperator();

    $first = $this->postJson('/api/admin/v1/projects/proj-1/content/categories', [
        'name' => 'News', 'slug' => 'news',
    ], $headers)->json('data');
    $second = $this->postJson('/api/admin/v1/projects/proj-1/content/categories', [
        'name' => 'Sport', 'slug' => 'sport',
    ], $headers)->json('data');

    ResponseSnapshot::assertMatches(
        $this->postJson('/api/admin/v1/projects/proj-1/content/categories/bulk-delete', [
            'ids' => [$first['id'], $second['id']],
        ], $headers),
        'categories-bulk-delete-204',
    );
});

test('contract: content categories bulk delete validation error', function () {
    $headers = actingAsContentOperator();

    ResponseSnapshot::assertMatches(
        $this->postJson('/api/admin/v1/projects/proj-1/content/categories/bulk-delete', [
            'ids' => [],
        ], $headers),
        'categories-bulk-delete-422',
    );
});

test('contract: content categories bulk delete forbidden', function () {
    $headers = actingAsContentOperator(permissions: ['content.categories.view']);

    ResponseSnapshot::assertMatches(
        $this->postJson('/api/admin/v1/projects/proj-1/content/categories/bulk-delete', [
            'ids' => [1],
        ], $headers),
        'categories-bulk-delete-403',
    );
});

test('contract: content categories purge', function () {
    $headers = actingAsContentOperator();

    $this->postJson('/api/admin/v1/projects/proj-1/content/categories', [
        'name' => 'News', 'slug' => 'news',
    ], $headers)->assertCreated();

    ResponseSnapshot::assertMatches(
        $this->deleteJson('/api/admin/v1/projects/proj-1/content/categories', [], $headers),
        'categories-purge-204',
    );
});

test('contract: content categories purge forbidden', function () {
    $headers = actingAsContentOperator(permissions: ['content.categories.view']);

    ResponseSnapshot::assertMatches(
        $this->deleteJson('/api/admin/v1/projects/proj-1/content/categories', [], $headers),
        'categories-purge-403',
    );
});

test('contract: content categories unauthenticated', function () {
    actingAsContentOperator();

    ResponseSnapshot::assertMatches(
        $this->getJson('/api/admin/v1/projects/proj-1/content/categories'),
        'categories-index-401',
    );
});

test('contract: content categories forbidden', function () {
    $headers = actingAsContentOperator(permissions: ['content.categories.view']);

    ResponseSnapshot::assertMatches(
        $this->postJson('/api/admin/v1/projects/proj-1/content/categories', [
            'name' => 'News', 'slug' => 'news',
        ], $headers),
        'categories-store-403',
    );
});

test('contract: content categories service disabled', function () {
    $headers = actingAsContentOperator(services: []);

    ResponseSnapshot::assertMatches(
        $this->getJson('/api/admin/v1/projects/proj-1/content/categories', $headers),
        'categories-index-service-disabled-404',
    );
});
