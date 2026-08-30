<?php

declare(strict_types=1);

namespace Cms\Research\Application\DTOs\Seo;

use Spatie\LaravelData\Data;
use Throwable;

/** Итог пересборки SEO: сколько сущностей обработано и чем закончились отказы. */
final class SeoRebuildResultDTO extends Data
{
    public function __construct(
        public int $processed,
        public int $total,
        public ?Throwable $lastError = null,
    ) {}

    public function nothingProcessed(): bool
    {
        return $this->processed === 0 && $this->total > 0;
    }

    public function hasFailures(): bool
    {
        return $this->processed < $this->total;
    }
}
