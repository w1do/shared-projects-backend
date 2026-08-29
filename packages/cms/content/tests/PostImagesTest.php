<?php

declare(strict_types=1);

use Cms\Content\Domain\Models\MediaFile;
use Cms\Content\Domain\Models\Post;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('local');
    Storage::fake('s3');
    config(['cms-content.media_disk' => 's3', 'cms-content.site_url' => 'https://site.test']);
});

/** Медиа-файл проекта без обращения к хранилищу: путь и mime задаются явно. */
function mediaFileFor(string $projectId, string $path = 'projects/proj-1/media/cover.jpg'): MediaFile
{
    app()->forgetScopedInstances();
    app(ProjectContext::class)->set($projectId);

    return MediaFile::create([
        'disk' => 's3',
        'path' => $path,
        'mime' => 'image/jpeg',
        'size' => 1024,
        'alt' => 'Cover alt',
    ]);
}

test('post keeps its image when the field is not sent and drops it on explicit null', function () {
    $headers = actingAsContentOperator();
    $media = mediaFileFor('proj-1');

    $post = $this->postJson('/api/admin/v1/projects/proj-1/content/posts', [
        'title' => 'With cover', 'cover_media_id' => $media->id,
    ], $headers)->assertCreated()->json('data');

    expect($post['cover']['id'])->toBe($media->id);

    // Поле не передано — прежнее изображение остаётся
    $kept = $this->putJson("/api/admin/v1/projects/proj-1/content/posts/{$post['id']}", [
        'title' => 'Renamed',
    ], $headers)->assertOk()->json('data');

    expect($kept['cover']['id'])->toBe($media->id);

    // Передан null — изображение снимается, файл в медиатеке остаётся
    $cleared = $this->putJson("/api/admin/v1/projects/proj-1/content/posts/{$post['id']}", [
        'title' => 'Renamed', 'cover_media_id' => null,
    ], $headers)->assertOk()->json('data');

    expect($cleared['cover'])->toBeNull()
        ->and(MediaFile::query()->count())->toBe(1);
});

test('post banner follows the same optional semantics as the cover', function () {
    $headers = actingAsContentOperator();
    $media = mediaFileFor('proj-1', 'projects/proj-1/media/banner.jpg');

    $post = $this->postJson('/api/admin/v1/projects/proj-1/content/posts', [
        'title' => 'With banner', 'banner_media_id' => $media->id,
    ], $headers)->assertCreated()->json('data');

    expect($post['banner']['id'])->toBe($media->id)
        ->and($post['cover'])->toBeNull();

    $kept = $this->putJson("/api/admin/v1/projects/proj-1/content/posts/{$post['id']}", [
        'title' => 'With banner',
    ], $headers)->assertOk()->json('data');

    expect($kept['banner']['id'])->toBe($media->id);
});

test('post rejects media of another project', function () {
    $foreign = mediaFileFor('proj-2', 'projects/proj-2/media/cover.jpg');
    $headers = actingAsContentOperator();

    $this->postJson('/api/admin/v1/projects/proj-1/content/posts', [
        'title' => 'Stolen cover', 'cover_media_id' => $foreign->id,
    ], $headers)->assertStatus(422)
        ->assertJsonPath('error.details.cover_media_id.0', 'The selected media file does not belong to this project.');

    expect(Post::acrossProjects()->count())->toBe(0);
});

test('post rejects a missing media file', function () {
    $headers = actingAsContentOperator();

    $this->postJson('/api/admin/v1/projects/proj-1/content/posts', [
        'title' => 'Ghost cover', 'banner_media_id' => 9999,
    ], $headers)->assertStatus(422)
        ->assertJsonPath('error.details.banner_media_id.0', 'The selected media file does not belong to this project.');
});

test('post image is returned as a platform link in admin and public api', function () {
    $headers = actingAsContentOperator();
    $media = mediaFileFor('proj-1');

    $post = $this->postJson('/api/admin/v1/projects/proj-1/content/posts', [
        'title' => 'Published', 'slug' => 'published', 'cover_media_id' => $media->id,
    ], $headers)->assertCreated()->json('data');

    $this->postJson("/api/admin/v1/projects/proj-1/content/posts/{$post['id']}/status", [
        'status' => 'published',
    ], $headers)->assertOk();

    $expected = ['id' => $media->id, 'url' => $media->url(), 'alt' => 'Cover alt'];

    $this->getJson("/api/admin/v1/projects/proj-1/content/posts/{$post['id']}", $headers)
        ->assertOk()->assertJsonPath('data.cover', $expected);

    $this->getJson('/api/v1/content/posts/published', actingAsProjectSite())
        ->assertOk()->assertJsonPath('data.cover', $expected);
});

test('deleting a media file leaves the post without an image', function () {
    $headers = actingAsContentOperator();
    $media = mediaFileFor('proj-1');

    $post = $this->postJson('/api/admin/v1/projects/proj-1/content/posts', [
        'title' => 'With cover', 'cover_media_id' => $media->id,
    ], $headers)->assertCreated()->json('data');

    $media->delete();

    expect(Post::query()->count())->toBe(1)
        ->and(Post::query()->find($post['id'])->cover_media_id)->toBeNull();

    $this->getJson("/api/admin/v1/projects/proj-1/content/posts/{$post['id']}", $headers)
        ->assertOk()->assertJsonPath('data.cover', null);
});
