<?php

declare(strict_types=1);

namespace Cms\Content\Application\Handlers;

use Cms\Content\Application\Commands\PurgeCategoriesCommand;
use Cms\Content\Domain\Models\Category;
use Illuminate\Support\Facades\DB;

/** Очистка каталога: весь скоуп проекта одним запросом, без обхода дерева. */
final class PurgeCategoriesHandler
{
    public function handle(PurgeCategoriesCommand $command): void
    {
        DB::transaction(function (): void {
            // Глобальный scope проекта задаёт границу; привязки постов уходят
            // каскадом внешнего ключа category_post, сами посты остаются.
            Category::query()->delete();
        });
    }
}
