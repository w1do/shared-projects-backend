<?php

declare(strict_types=1);

namespace Cms\Content\Infrastructure\Jobs;

use Cms\Content\Domain\Models\MediaFile;
use Cms\Shared\Tenant\ProjectAwareJob;

/** Генерация превью-вариантов изображения. Никогда не в HTTP-запросе. */
final class GenerateMediaVariantsJob extends ProjectAwareJob
{
    public function __construct(string $projectId, public readonly int $mediaId)
    {
        parent::__construct($projectId);
    }

    protected function execute(): void
    {
        $media = MediaFile::query()->find($this->mediaId);
        if ($media === null || ! str_starts_with($media->mime, 'image/')) {
            return;
        }

        // MVP: регистрируем вариант-плейсхолдеры; ресайз подключается intervention/image
        $media->forceFill([
            'variants' => [
                'thumb' => $media->path, // до подключения ресайза варианты указывают на оригинал
                'original' => $media->path,
            ],
        ])->save();
    }
}
