<?php

declare(strict_types=1);

namespace Cms\Content\Application\DTOs\Post;

use Cms\Content\Domain\Models\MediaFile;
use Spatie\LaravelData\Data;

/** Изображение поста на выдачу: ссылка платформы вместо голого идентификатора. */
final class PostImageDTO extends Data
{
    public function __construct(
        public int $id,
        public string $url,
        public ?string $alt,
    ) {}

    public static function fromModel(MediaFile $media): self
    {
        return new self(
            id: $media->id,
            url: $media->url(),
            alt: $media->alt,
        );
    }
}
