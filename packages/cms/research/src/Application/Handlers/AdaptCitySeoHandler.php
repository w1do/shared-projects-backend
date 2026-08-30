<?php

declare(strict_types=1);

namespace Cms\Research\Application\Handlers;

use Cms\Content\Application\Commands\UpsertSeoCommand;
use Cms\Content\Application\Handlers\UpsertSeoHandler;
use Cms\Content\Domain\Models\City;
use Cms\Instructs\Application\Actions\ResolveInstructAction;
use Cms\Instructs\Domain\Enums\InstructCategory;
use Cms\Instructs\Domain\Models\Instruct;
use Cms\Research\Application\Actions\ComposeCitySeoAction;
use Cms\Research\Application\Actions\KeepOperatorSeoFieldsAction;
use Cms\Research\Application\Commands\AdaptCitySeoCommand;
use Cms\Research\Application\DTOs\Seo\SeoRebuildResultDTO;
use Cms\Shared\BackgroundTasks\TaskProgress;
use Illuminate\Contracts\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Throwable;

/**
 * Заполнение SEO включённых городов проекта по AI.
 *
 * Города обходятся пачками, ход задачи двигается после каждой. Отказ по городу
 * не прерывает задачу и не затирает его сохранённое SEO.
 */
final readonly class AdaptCitySeoHandler
{
    private const CHUNK = 25;

    public function __construct(
        private ResolveInstructAction $instructs,
        private ComposeCitySeoAction $citySeo,
        private KeepOperatorSeoFieldsAction $operatorFields,
        private UpsertSeoHandler $seo,
        private TaskProgress $progress,
    ) {}

    public function handle(AdaptCitySeoCommand $command): SeoRebuildResultDTO
    {
        $instruct = $this->instructs->handle(InstructCategory::CitySeo);
        $topic = (string) $command->topic;
        $total = $this->enabled()->count();

        $processed = 0;
        $lastError = null;

        $this->enabled()->with(['region', 'seo'])->chunkById(
            self::CHUNK,
            function (Collection $cities) use ($instruct, $topic, $command, $total, &$processed, &$lastError): void {
                foreach ($cities as $city) {
                    try {
                        $this->adapt($instruct, $city, $topic);
                        $processed++;
                    } catch (Throwable $error) {
                        $lastError = $error;
                    }
                }

                $this->stage($command, $processed.'/'.$total);
            },
        );

        return new SeoRebuildResultDTO($processed, $total, $lastError);
    }

    private function adapt(Instruct $instruct, City $city, string $topic): void
    {
        $fresh = $this->citySeo->handle($instruct, $city, $topic);

        $this->seo->handle(new UpsertSeoCommand($city, $this->operatorFields->handle($city->seo, $fresh)));
    }

    /** @return Builder<City> */
    private function enabled(): Builder
    {
        return City::query()->whereHas('enrollments', fn (Builder $query) => $query->where('enabled', true));
    }

    private function stage(AdaptCitySeoCommand $command, string $stage): void
    {
        if ($command->taskId !== null) {
            $this->progress->stage($command->taskId, $stage);
        }
    }
}
