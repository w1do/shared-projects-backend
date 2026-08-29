<?php

declare(strict_types=1);

namespace Cms\Content\Application\DTOs\Media;

use Cms\Content\Domain\Models\MediaFile;
use Spatie\LaravelData\Data;

/** Медиафайл на выдачу: состав и порядок полей — прежний контракт ответа. */
final class MediaDTO extends Data
{
    /** @param  ?array<string, string>  $variants */
    public function __construct(
        public int $id,
        public string $path,
        public string $url,
        public string $mime,
        public int $size,
        public ?string $alt,
        public ?array $variants,
    ) {}

    public static function fromModel(MediaFile $media): self
    {
        return new self(
            id: $media->id,
            path: $media->path,
            // Ссылка платформы: клиент не знает адреса хранилища проекта
            url: $media->url(),
            mime: $media->mime,
            size: $media->size,
            alt: $media->alt,
            variants: $media->variants,
        );
    }
}
