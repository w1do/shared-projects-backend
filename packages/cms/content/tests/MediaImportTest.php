<?php

declare(strict_types=1);

use Cms\Content\Application\Commands\ImportMediaCommand;
use Cms\Content\Application\DTOs\Media\ImportMediaDTO;
use Cms\Content\Application\Exceptions\ContentRuleViolation;
use Cms\Content\Application\Handlers\ImportMediaHandler;
use Cms\Content\Domain\Contracts\RemoteFileFetcher;
use Cms\Content\Domain\Models\MediaFile;
use Cms\Content\Infrastructure\Jobs\GenerateMediaVariantsJob;
use Cms\Shared\BackgroundTasks\BackgroundTask;
use Cms\Shared\BackgroundTasks\BackgroundTaskKind;
use Cms\Shared\BackgroundTasks\BackgroundTaskState;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('local');
    Storage::fake('s3');
    config(['cms-content.media_disk' => 's3']);
    fakeHostResolver();
});

test('fetcher downloads an image from a public address', function () {
    Http::fake(['images.test/*' => Http::response(onePixelPng(), 200, ['Content-Type' => 'image/png'])]);

    $file = app(RemoteFileFetcher::class)->fetch('https://images.test/photo.png');

    expect($file->mime)->toBe('image/png')
        ->and($file->extension)->toBe('png')
        ->and($file->size)->toBe(strlen(onePixelPng()));
});

test('fetcher refuses non http schemes and private addresses', function () {
    Http::fake();

    expect(fn () => app(RemoteFileFetcher::class)->fetch('file:///etc/passwd'))
        ->toThrow(ContentRuleViolation::class);

    expect(fn () => app(RemoteFileFetcher::class)->fetch('http://127.0.0.1/photo.png'))
        ->toThrow(ContentRuleViolation::class);

    expect(fn () => app(RemoteFileFetcher::class)->fetch('http://[::1]/photo.png'))
        ->toThrow(ContentRuleViolation::class);

    fakeHostResolver(['10.0.0.5']);
    expect(fn () => app(RemoteFileFetcher::class)->fetch('https://internal.test/photo.png'))
        ->toThrow(ContentRuleViolation::class);

    fakeHostResolver([]);
    expect(fn () => app(RemoteFileFetcher::class)->fetch('https://unknown.test/photo.png'))
        ->toThrow(ContentRuleViolation::class);

    Http::assertNothingSent();
});

test('fetcher refuses a file of an unsupported type', function () {
    Http::fake(['images.test/*' => Http::response('plain text, not an image', 200, ['Content-Type' => 'image/png'])]);

    expect(fn () => app(RemoteFileFetcher::class)->fetch('https://images.test/photo.png'))
        ->toThrow(ContentRuleViolation::class);
});

test('fetcher refuses a file over the size limit', function () {
    config(['cms-content.media_max_size_kb' => 1]);
    Http::fake(['images.test/*' => Http::response(str_repeat('a', 2048), 200)]);

    expect(fn () => app(RemoteFileFetcher::class)->fetch('https://images.test/huge.png'))
        ->toThrow(ContentRuleViolation::class);
});

test('fetcher refuses an unreachable link', function () {
    Http::fake(['images.test/*' => Http::response('', 404)]);

    expect(fn () => app(RemoteFileFetcher::class)->fetch('https://images.test/missing.png'))
        ->toThrow(ContentRuleViolation::class);
});

test('import creates a project media file and queues variant generation', function () {
    Queue::fake();
    Http::fake(['images.test/*' => Http::response(onePixelPng(), 200, ['Content-Type' => 'image/png'])]);
    app(ProjectContext::class)->set('proj-1');

    $media = app(ImportMediaHandler::class)->handle(
        new ImportMediaCommand(new ImportMediaDTO(url: 'https://images.test/photo.png', alt: 'Imported')),
    );

    expect($media->project_id)->toBe('proj-1')
        ->and($media->mime)->toBe('image/png')
        ->and($media->alt)->toBe('Imported')
        ->and($media->path)->toStartWith('projects/proj-1/media/')
        ->and($media->path)->toEndWith('.png');

    Storage::disk('s3')->assertExists($media->path);
    Queue::assertPushed(GenerateMediaVariantsJob::class);
});

test('import endpoint returns the created media file', function () {
    Http::fake(['images.test/*' => Http::response(onePixelPng(), 200, ['Content-Type' => 'image/png'])]);
    $headers = actingAsContentOperator();

    $this->postJson('/api/admin/v1/projects/proj-1/content/media/import', [
        'url' => 'https://images.test/photo.png', 'alt' => 'Imported',
    ], $headers)->assertCreated()->assertJsonPath('data.mime', 'image/png');

    expect(MediaFile::acrossProjects()->count())->toBe(1);
});

test('import endpoint is closed by the media manage permission', function () {
    Http::fake(['images.test/*' => Http::response(onePixelPng(), 200)]);
    $headers = actingAsContentOperator(permissions: ['content.media.view']);

    $this->postJson('/api/admin/v1/projects/proj-1/content/media/import', [
        'url' => 'https://images.test/photo.png',
    ], $headers)->assertStatus(403);

    expect(MediaFile::acrossProjects()->count())->toBe(0);
});

test('import endpoint rejects an unreachable link and a disallowed type without creating media', function () {
    $headers = actingAsContentOperator();

    Http::fake([
        'broken.test/*' => Http::response('', 500),
        'pages.test/*' => Http::response('<html>not an image</html>', 200),
    ]);

    $this->postJson('/api/admin/v1/projects/proj-1/content/media/import', [
        'url' => 'https://broken.test/broken.png',
    ], $headers)->assertStatus(422)
        ->assertJsonPath('error.details.url.0', 'The file could not be downloaded from the given link.');

    $this->postJson('/api/admin/v1/projects/proj-1/content/media/import', [
        'url' => 'https://pages.test/page.html',
    ], $headers)->assertStatus(422)
        ->assertJsonPath('error.details.url.0', 'The linked file is not a supported image or exceeds the size limit.');

    expect(MediaFile::acrossProjects()->count())->toBe(0)
        ->and(Storage::disk('s3')->allFiles())->toBe([]);
});

test('import endpoint rejects a non http url before any request', function () {
    Http::fake();
    $headers = actingAsContentOperator();

    $this->postJson('/api/admin/v1/projects/proj-1/content/media/import', [
        'url' => 'ftp://images.test/photo.png',
    ], $headers)->assertStatus(422);

    Http::assertNothingSent();
    expect(MediaFile::acrossProjects()->count())->toBe(0);
});

test('импорт по ссылке виден в реестре фоновых задач', function () {
    Http::fake(['images.test/*' => Http::response(onePixelPng(), 200, ['Content-Type' => 'image/png'])]);
    Queue::fake();
    app(ProjectContext::class)->set('proj-1');

    $media = app(ImportMediaHandler::class)->handle(
        new ImportMediaCommand(ImportMediaDTO::from(['url' => 'https://images.test/photo.png'])),
    );

    $task = BackgroundTask::query()->latest('id')->firstOrFail();

    expect($task->kind)->toBe(BackgroundTaskKind::MediaImport)
        ->and($task->state)->toBe(BackgroundTaskState::Succeeded)
        ->and($task->subject_id)->toBe((string) $media->id)
        ->and($task->finished_at)->not->toBeNull();
});

test('отказ скачивания попадает в реестр как отклонённая задача', function () {
    Http::fake();
    app(ProjectContext::class)->set('proj-1');

    expect(fn () => app(ImportMediaHandler::class)->handle(
        new ImportMediaCommand(ImportMediaDTO::from(['url' => 'http://127.0.0.1/photo.png'])),
    ))->toThrow(ContentRuleViolation::class);

    $task = BackgroundTask::query()->latest('id')->firstOrFail();

    expect($task->state)->toBe(BackgroundTaskState::Failed)
        ->and($task->failure_reason)->not->toBeNull()
        ->and($task->failure_reason)->not->toContain('Exception');
});
