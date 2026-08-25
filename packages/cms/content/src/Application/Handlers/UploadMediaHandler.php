<?php

declare(strict_types=1);

namespace Cms\Content\Application\Handlers;

use Cms\Content\Application\Commands\UploadMediaCommand;
use Cms\Content\Domain\Models\MediaFile;
use Cms\Content\Infrastructure\Jobs\GenerateMediaVariantsJob;
use Cms\Shared\Tenant\ProjectContext;

/** Загрузка медиа: файл кладётся в S3 (MinIO), варианты генерируются асинхронно. */
final class UploadMediaHandler
{
    public function __construct(private readonly ProjectContext $context) {}

    public function handle(UploadMediaCommand $command): MediaFile
    {
        $projectId = $this->context->required();
        $disk = (string) config('cms-content.media_disk', 's3');
        $path = $command->file->store("projects/{$projectId}/media", $disk);

        $media = MediaFile::create([
            'disk' => $disk,
            'path' => $path,
            'mime' => (string) $command->file->getMimeType(),
            'size' => $command->file->getSize(),
            'alt' => $command->alt,
        ]);

        // Ответ сразу, превью — в очереди media
        GenerateMediaVariantsJob::dispatch($projectId, $media->id)->onQueue('media');

        return $media;
    }
}
