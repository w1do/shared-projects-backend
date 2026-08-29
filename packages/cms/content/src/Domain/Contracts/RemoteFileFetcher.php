<?php

declare(strict_types=1);

namespace Cms\Content\Domain\Contracts;

use Cms\Content\Domain\ValueObjects\RemoteFile;

/** Порт скачивания файла по внешней ссылке: реализация отвечает за таймаут, редиректы и допустимость адреса. */
interface RemoteFileFetcher
{
    public function fetch(string $url): RemoteFile;
}
