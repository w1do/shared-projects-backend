<?php

declare(strict_types=1);

namespace Cms\Content\Application\Commands;

use Cms\Content\Application\DTOs\Page\UpsertPageDTO;
use Cms\Content\Domain\Models\Page;

/** Команда-намерение: данные для UpsertPageHandler. */
final readonly class UpsertPageCommand
{
    public function __construct(
        public UpsertPageDTO $data,
        public ?Page $page = null,
    ) {}
}
