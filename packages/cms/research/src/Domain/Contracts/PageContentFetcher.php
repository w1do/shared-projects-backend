<?php

declare(strict_types=1);

namespace Cms\Research\Domain\Contracts;

use Cms\Research\Domain\ValueObjects\PageContent;

/** Порт загрузки страницы-источника: null, если страницу не удалось разобрать. */
interface PageContentFetcher
{
    public function fetch(string $url): ?PageContent;
}
