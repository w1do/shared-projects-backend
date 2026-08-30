<?php

declare(strict_types=1);

namespace Cms\Content\Application\Handlers;

use Cms\Content\Application\Actions\ApplyStarterCitiesAction;
use Cms\Content\Application\Actions\EnrollCitiesAction;
use Cms\Content\Domain\Models\ProjectCity;

/** Возврат состава проекта к стартовому набору: крупнейшие включены, остальные выключены. */
final readonly class ResetCitiesToStarterHandler
{
    public function __construct(
        private ApplyStarterCitiesAction $starter,
        private EnrollCitiesAction $enroll,
    ) {}

    /** @return int число включённых городов */
    public function handle(): int
    {
        $ids = $this->starter->starterIds();

        ProjectCity::query()->update(['enabled' => false]);
        $this->enroll->handle($ids, true);

        return count($ids);
    }
}
