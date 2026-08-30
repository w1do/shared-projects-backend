<?php

declare(strict_types=1);

namespace Cms\Content\Application\Handlers;

use Cms\Content\Application\Actions\EnrollCitiesAction;
use Cms\Content\Domain\Models\City;

/** Включение всех городов справочника в текущем проекте одним действием. */
final readonly class EnableAllCitiesHandler
{
    public function __construct(private EnrollCitiesAction $enroll) {}

    /** @return int число включённых городов */
    public function handle(): int
    {
        /** @var list<int> $ids */
        $ids = City::query()->pluck('id')->map(fn (mixed $id): int => (int) $id)->all();

        $this->enroll->handle($ids, true);

        return count($ids);
    }
}
