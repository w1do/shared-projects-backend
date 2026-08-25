<?php

declare(strict_types=1);

namespace Cms\Pay\Application\Handlers;

use Cms\Pay\Application\Commands\ArchivePlanCommand;
use Cms\Pay\Domain\Models\Plan;

/** План с подписками не удаляется физически — только архивируется. */
final class ArchivePlanHandler
{
    public function handle(ArchivePlanCommand $command): Plan
    {
        $plan = $command->plan;

        // Физическое удаление не поддерживается: архивация — всегда безопасный путь,
        // существующие подписки продолжают работать.
        $plan->forceFill(['archived_at' => now()])->save();

        return $plan;
    }
}
