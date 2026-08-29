<?php

declare(strict_types=1);

namespace Cms\Content\Domain\ValueObjects;

/** Скачанный по внешней ссылке файл: содержимое и уже проверенные тип с размером. */
final readonly class RemoteFile
{
    public function __construct(
        public string $contents,
        public string $mime,
        public int $size,
        public string $extension,
    ) {}
}
