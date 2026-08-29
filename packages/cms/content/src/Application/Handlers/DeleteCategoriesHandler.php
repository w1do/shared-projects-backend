<?php

declare(strict_types=1);

namespace Cms\Content\Application\Handlers;

use Cms\Content\Application\Commands\DeleteCategoriesCommand;
use Cms\Content\Domain\Models\Category;
use Illuminate\Support\Facades\DB;

/** Массовое удаление категорий: целиком или никак, чужие и несуществующие id пропускаются. */
final class DeleteCategoriesHandler
{
    public function handle(DeleteCategoriesCommand $command): void
    {
        DB::transaction(function () use ($command): void {
            foreach ($command->ids as $id) {
                // Узел ищется заново на каждом шаге: удаление предка уже унесло
                // потомка, а глобальный scope проекта отсекает чужие id.
                Category::query()->find($id)?->delete();
            }
        });
    }
}
