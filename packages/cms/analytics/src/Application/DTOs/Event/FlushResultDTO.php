<?php

declare(strict_types=1);

namespace Cms\Analytics\Application\DTOs\Event;

use Spatie\LaravelData\Data;

/** Итог одного прохода буфера: сколько строк записано и сколько ушло в dead-letter. */
final class FlushResultDTO extends Data
{
    public function __construct(
        public int $flushed,
        public int $dead,
    ) {}
}
