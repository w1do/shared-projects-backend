<?php

declare(strict_types=1);

use Cms\Shared\Testing\ResponseSnapshot;
use Illuminate\Http\Testing\File;
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
