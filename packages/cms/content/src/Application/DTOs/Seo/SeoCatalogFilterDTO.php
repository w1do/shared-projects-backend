<?php

declare(strict_types=1);

namespace Cms\Content\Application\DTOs\Seo;

use Cms\Content\Domain\Enums\SeoableType;
use Spatie\LaravelData\Data;

/** Отбор каталога SEO: тип сущности, поле и направление сортировки, размер страницы. */
final class SeoCatalogFilterDTO extends Data
{
    public function __construct(
        public ?SeoableType $type = null,
        public string $sort = 'updated_at',
        public string $direction = 'desc',
        public int $per_page = 25,
    ) {}
}
