<?php

declare(strict_types=1);

namespace Cms\Content\Application\Commands;

use Cms\Content\Application\DTOs\Content\ChangeStatusDTO;
use Cms\Content\Domain\Models\Page;
use Cms\Content\Domain\Models\Post;

/** Команда-намерение: данные для ChangeStatusHandler. */
final readonly class ChangeStatusCommand
{
    public function __construct(
        public Post|Page $model,
        public ChangeStatusDTO $data,
    ) {}
}
