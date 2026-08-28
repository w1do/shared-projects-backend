<?php

declare(strict_types=1);

namespace Cms\Pay\Application\Queries;

use Cms\Pay\Application\Exceptions\PlanNotAvailable;
use Cms\Pay\Domain\Models\Plan;

/**
 * Тарифный план для сайтового оформления: по `plan_code`, только живой.
 * Неизвестный и архивный коды дают одну доменную ошибку — текст-контракт
 * снимков public-subscribe-422-unknown-plan / -archived-plan.
 */
final class FindSitePlanQuery
{
    public function handle(string $planCode): Plan
    {
        $plan = Plan::query()->where('code', $planCode)->whereNull('archived_at')->first();
        if ($plan === null) {
            throw PlanNotAvailable::make();
        }

        return $plan;
    }
}
