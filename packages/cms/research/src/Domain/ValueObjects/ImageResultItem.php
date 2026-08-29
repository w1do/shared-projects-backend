<?php

declare(strict_types=1);

namespace Cms\Research\Domain\ValueObjects;

/** Одна позиция выдачи поиска картинок: само изображение, превью, размеры и страница-источник. */
final readonly class ImageResultItem
{
    public function __construct(
        public string $link,
        public ?string $thumbnail = null,
        public ?int $width = null,
        public ?int $height = null,
        public ?string $source = null,
    ) {}
}
