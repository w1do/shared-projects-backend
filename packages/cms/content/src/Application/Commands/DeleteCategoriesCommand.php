<?php

declare(strict_types=1);

namespace Cms\Content\Application\Commands;

/** Команда-намерение: данные для DeleteCategoriesHandler. */
final readonly class DeleteCategoriesCommand
{
    /** @param  list<int>  $ids */
    public function __construct(
        public array $ids,
    ) {}
}
