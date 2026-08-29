<?php

declare(strict_types=1);

namespace Cms\Research\Domain\Contracts;

use Cms\Research\Domain\Enums\SearchEngine;
use Cms\Research\Domain\ValueObjects\SearchResultItem;

/** Порт поисковой службы: конкретная служба — деталь инфраструктуры. */
interface SerpSearchClient
{
    /** @return list<SearchResultItem> */
    public function search(string $query, SearchEngine $engine, int $limit): array;
}
