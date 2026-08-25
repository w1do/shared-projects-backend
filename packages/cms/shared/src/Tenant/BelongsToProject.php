<?php

declare(strict_types=1);

namespace Cms\Shared\Tenant;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

/**
 * Трейт для моделей с project_id: глобальный scope по текущему проекту
 * и автозаполнение project_id при создании. Запрос без контекста — ошибка,
 * а не выборка по всем проектам.
 */
trait BelongsToProject
{
    public static function bootBelongsToProject(): void
    {
        static::addGlobalScope('project', function (Builder $builder): void {
            $context = app(ProjectContext::class);
            if ($context->resolved()) {
                $builder->where($builder->getModel()->qualifyColumn('project_id'), $context->id());
            }
        });

        // saving (а не creating): другие трейты (nested set) считают
        // scope-зависимые значения в saving — project_id должен быть уже заполнен
        static::saving(function (Model $model): void {
            if ($model->getAttribute('project_id') === null) {
                $model->setAttribute('project_id', app(ProjectContext::class)->required());
            }
        });
    }

    /**
     * Явный обход scope'а — только для системных операций (джобы обслуживания, консоль).
     *
     * @return Builder<static>
     */
    public static function acrossProjects(): Builder
    {
        return static::query()->withoutGlobalScope('project');
    }
}
