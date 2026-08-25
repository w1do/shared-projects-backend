<?php

declare(strict_types=1);

namespace Cms\Analytics\Application\Commands;

/** Команда-намерение: данные для FlushBufferHandler. */
final readonly class FlushBufferCommand
{
    public function __construct(
        public ?int $batchSize = null,
    ) {}
}
