<?php

declare(strict_types=1);

namespace Cms\Content\Application\Commands;

use Cms\Content\Application\DTOs\Media\ImportMediaDTO;

/** Команда-намерение: данные для ImportMediaHandler. */
final readonly class ImportMediaCommand
{
    public function __construct(
        public ImportMediaDTO $data,
    ) {}
}
