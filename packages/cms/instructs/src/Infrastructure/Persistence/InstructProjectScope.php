<?php

declare(strict_types=1);

namespace Cms\Instructs\Infrastructure\Persistence;

use Closure;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

/**
 * Изоляция инструкций: проект контекста плюс предустановленные платформой.
 *
 * Scope живёт в статическом реестре модели, поэтому контекст берётся резолвером,
 * а не хранится экземпляром: `ProjectContext` — scoped, и под Octane
 * запомненный экземпляр протёк бы между запросами.
 */
final readonly class InstructProjectScope implements Scope
{
    /** @param Closure(): ProjectContext $context */
    public function __construct(private Closure $context) {}

    public function apply(Builder $builder, Model $model): void
    {
        $context = ($this->context)();

        if (! $context->resolved()) {
            return;
        }

        $projectId = $context->id();

        $builder->where(function (Builder $builder) use ($model, $projectId): void {
            $builder
                ->where($model->qualifyColumn('project_id'), $projectId)
                ->orWhere($model->qualifyColumn('is_system'), true);
        });
    }
}
