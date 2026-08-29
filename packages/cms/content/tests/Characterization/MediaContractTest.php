<?php

declare(strict_types=1);

use Cms\Shared\Testing\ResponseSnapshot;
use Illuminate\Http\Testing\File;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Характеризационные снимки медиа-контракта (routes/admin.php):
 * $request->validate() в контроллере и ручной массив MediaController::serialize.
 */
beforeEach(function () {
    Storage::fake('local');
    Storage::fake('s3');
    config(['cms-content.media_disk' => 's3', 'cms-content.site_url' => 'https://site.test']);

    // UploadedFile::hashName() строит путь через Str::random(40):
    // без фиксации имя файла меняется от прогона к прогону
    Str::createRandomStringsUsing(fn (int $length = 16): string => str_repeat('a', $length));
});

afterEach(function () {
    Str::createRandomStringsNormally();
});

test('contract: content media store', function () {
    $headers = actingAsContentOperator();

    ResponseSnapshot::assertMatches(
        $this->post('/api/admin/v1/projects/proj-1/content/media', [
            'file' => File::create('photo.jpg', 12),
            'alt' => 'Cover photo',
        ], $headers),
        'media-store',
    );
});

test('contract: content media store without alt', function () {
    $headers = actingAsContentOperator();

    ResponseSnapshot::assertMatches(
        $this->post('/api/admin/v1/projects/proj-1/content/media', [
            'file' => File::create('photo.jpg', 12),
        ], $headers),
        'media-store-without-alt',
    );
});

test('contract: content media store validation error', function () {
    $headers = actingAsContentOperator();

    // файл не передан + alt длиннее 255 символов
    ResponseSnapshot::assertMatches(
        $this->post('/api/admin/v1/projects/proj-1/content/media', [
            'alt' => str_repeat('a', 256),
        ], $headers),
        'media-store-422',
    );
});

test('contract: content media store rejects oversized file', function () {
    $headers = actingAsContentOperator();

    ResponseSnapshot::assertMatches(
        $this->post('/api/admin/v1/projects/proj-1/content/media', [
            'file' => File::create('huge.jpg', 20481),
        ], $headers),
        'media-store-422-too-large',
    );
});

test('contract: content media index', function () {
    $headers = actingAsContentOperator();

    $this->post('/api/admin/v1/projects/proj-1/content/media', [
        'file' => File::create('photo.jpg', 12),
        'alt' => 'Cover photo',
    ], $headers)->assertCreated();

    ResponseSnapshot::assertMatches(
        $this->getJson('/api/admin/v1/projects/proj-1/content/media', $headers),
        'media-index',
    );
});

test('contract: content media index empty', function () {
    $headers = actingAsContentOperator();

    ResponseSnapshot::assertMatches(
        $this->getJson('/api/admin/v1/projects/proj-1/content/media', $headers),
        'media-index-empty',
    );
});

test('contract: content media unauthenticated', function () {
    actingAsContentOperator();

    ResponseSnapshot::assertMatches(
        $this->getJson('/api/admin/v1/projects/proj-1/content/media'),
        'media-index-401',
    );
});

test('contract: content media forbidden', function () {
    $headers = actingAsContentOperator(permissions: ['content.media.view']);

    ResponseSnapshot::assertMatches(
        $this->post('/api/admin/v1/projects/proj-1/content/media', [
            'file' => File::create('photo.jpg', 12),
        ], $headers),
        'media-store-403',
    );
});

test('contract: content media import', function () {
    fakeHostResolver();
    Http::fake(['images.test/*' => Http::response(onePixelPng(), 200, ['Content-Type' => 'image/png'])]);

    $headers = actingAsContentOperator();

    ResponseSnapshot::assertMatches(
        $this->postJson('/api/admin/v1/projects/proj-1/content/media/import', [
            'url' => 'https://images.test/photo.png',
            'alt' => 'Imported photo',
        ], $headers),
        'media-import',
    );
});

test('contract: content media import validation error', function () {
    fakeHostResolver();
    Http::fake();

    $headers = actingAsContentOperator();

    ResponseSnapshot::assertMatches(
        $this->postJson('/api/admin/v1/projects/proj-1/content/media/import', [
            'url' => 'not a url',
            'alt' => str_repeat('a', 256),
        ], $headers),
        'media-import-422',
    );
});

test('contract: content media import of an unreachable link', function () {
    fakeHostResolver();
    Http::fake(['images.test/*' => Http::response('', 500)]);

    $headers = actingAsContentOperator();

    ResponseSnapshot::assertMatches(
        $this->postJson('/api/admin/v1/projects/proj-1/content/media/import', [
            'url' => 'https://images.test/broken.png',
        ], $headers),
        'media-import-422-unreachable',
    );
});

test('contract: content media import forbidden', function () {
    fakeHostResolver();
    Http::fake();

    $headers = actingAsContentOperator(permissions: ['content.media.view']);

    ResponseSnapshot::assertMatches(
        $this->postJson('/api/admin/v1/projects/proj-1/content/media/import', [
            'url' => 'https://images.test/photo.png',
        ], $headers),
        'media-import-403',
    );
});
