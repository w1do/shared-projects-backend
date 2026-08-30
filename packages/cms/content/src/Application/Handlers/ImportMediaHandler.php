<?php

declare(strict_types=1);

namespace Cms\Content\Application\Handlers;

use Cms\Content\Application\Commands\ImportMediaCommand;
use Cms\Content\Domain\Contracts\RemoteFileFetcher;
use Cms\Content\Domain\Models\MediaFile;
use Cms\Content\Infrastructure\Jobs\GenerateMediaVariantsJob;
use Cms\Shared\BackgroundTasks\BackgroundTaskKind;
use Cms\Shared\BackgroundTasks\TaskProgress;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Throwable;

/** Импорт медиа по ссылке: скачанный файл дальше идёт тем же путём, что и загруженный. */
final class ImportMediaHandler
{
    public function __construct(
        private readonly ProjectContext $context,
        private readonly RemoteFileFetcher $fetcher,
        private readonly TaskProgress $progress,
    ) {}

    public function handle(ImportMediaCommand $command): MediaFile
    {
        $projectId = $this->context->required();
        $taskId = $this->progress->queue(BackgroundTaskKind::MediaImport, 'url', $command->data->url);

        try {
            $media = $this->import($projectId, $command, $taskId);
        } catch (Throwable $error) {
            $this->progress->fail($taskId, $error);

            throw $error;
        }

        $this->progress->succeed($taskId);

        return $media;
    }

    private function import(string $projectId, ImportMediaCommand $command, int $taskId): MediaFile
    {
        $this->progress->start($taskId, 'downloading');

        // Отказ скачивания поднимает исключение до создания записи медиа
        $file = $this->fetcher->fetch($command->data->url);

        $this->progress->stage($taskId, 'saving');

        $disk = (string) config('cms-content.media_disk', 's3');
        $path = "projects/{$projectId}/media/".Str::random(40).'.'.$file->extension;
        Storage::disk($disk)->put($path, $file->contents);

        $media = MediaFile::create([
            'disk' => $disk,
            'path' => $path,
            'mime' => $file->mime,
            'size' => $file->size,
            'alt' => $command->data->alt,
        ]);

        GenerateMediaVariantsJob::dispatch($projectId, $media->id)->onQueue('media');

        return $media;
    }
}
