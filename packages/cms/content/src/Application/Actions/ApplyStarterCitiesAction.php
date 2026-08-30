<?php

declare(strict_types=1);

namespace Cms\Content\Application\Actions;

use Cms\Content\Domain\Models\City;
use Cms\Content\Domain\Models\ProjectCity;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Contracts\Config\Repository as Config;

/**
 * Стартовый набор городов проекта: крупнейшие по населению. Применяется один
 * раз — пока у проекта нет ни одной строки включённости (Decision Д4).
 */
final readonly class ApplyStarterCitiesAction
{
    public function __construct(
        private ProjectContext $context,
        private Config $config,
        private EnrollCitiesAction $enroll,
    ) {}

    public function handle(): void
    {
        if (ProjectCity::query()->exists()) {
            return;
        }

        $this->enroll->handle($this->starterIds(), true);
    }

    /** @return list<int> */
    public function starterIds(): array
    {
        $this->context->required();

        return array_values(
            City::query()
                ->orderByDesc('population')
                ->orderBy('id')
                ->limit((int) $this->config->get('cms-content.city_starter_size', 10))
                ->pluck('id')
                ->map(fn (mixed $id): int => (int) $id)
                ->all(),
        );
    }
}
