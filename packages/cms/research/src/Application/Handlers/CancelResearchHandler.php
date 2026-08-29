<?php

declare(strict_types=1);

namespace Cms\Research\Application\Handlers;

use Cms\Research\Application\Commands\CancelResearchCommand;
use Cms\Research\Domain\Enums\ResearchStatus;
use Cms\Research\Domain\Models\Research;
use Illuminate\Database\Eloquent\ModelNotFoundException;

/** Отмена идемпотентна: повтор для завершённого исследования не меняет состояние. */
final readonly class CancelResearchHandler
{
    public function handle(CancelResearchCommand $command): Research
    {
        $research = Research::query()->whereKey($command->researchId)->first();

        if ($research === null) {
            throw (new ModelNotFoundException)->setModel(Research::class, [$command->researchId]);
        }

        if (! $research->status->canTransitionTo(ResearchStatus::Canceled)) {
            return $research;
        }

        $research->status = ResearchStatus::Canceled;
        $research->completed_at = $research->freshTimestamp();
        $research->save();

        return $research;
    }
}
