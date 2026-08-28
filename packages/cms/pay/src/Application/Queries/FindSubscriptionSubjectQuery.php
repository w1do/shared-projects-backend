<?php

declare(strict_types=1);

namespace Cms\Pay\Application\Queries;

use Cms\Pay\Application\Exceptions\PlanNotAvailable;
use Cms\Pay\Application\Exceptions\SubjectNotSubscribable;
use Cms\Pay\Domain\Models\Plan;
use Cms\Shared\Billing\Subscribable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\Relation;

/**
 * Предмет подписки для admin-оформления: морф-алиас → модель проекта,
 * обязанная реализовать `Subscribable` (Д16). Tenant-изоляция — глобальным
 * скоупом `BelongsToProject` модели предмета.
 */
final class FindSubscriptionSubjectQuery
{
    public function handle(string $subjectType, string $subjectId): Model&Subscribable
    {
        $class = Relation::getMorphedModel($subjectType);
        if ($class === null || ! is_subclass_of($class, Model::class)) {
            throw SubjectNotSubscribable::make();
        }

        $subject = $class::query()->whereKey($subjectId)->first();
        if (! $subject instanceof Subscribable) {
            throw SubjectNotSubscribable::make();
        }

        // Архивный тарифный план недоступен и по прямому id — как и по коду
        if ($subject instanceof Plan && $subject->isArchived()) {
            throw PlanNotAvailable::make();
        }

        return $subject;
    }
}
