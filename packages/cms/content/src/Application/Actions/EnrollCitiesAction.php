<?php

declare(strict_types=1);

namespace Cms\Content\Application\Actions;

use Cms\Content\Domain\Models\ProjectCity;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Support\Carbon;

/**
 * Запись включённости пачкой: массовые действия по справочнику идут одним
 * запросом, а не тысячей одиночных (Decision Д9).
 */
final readonly class EnrollCitiesAction
{
    private const CHUNK = 500;

    public function __construct(private ProjectContext $context) {}

    /** @param  list<int>  $cityIds */
    public function handle(array $cityIds, bool $enabled): void
    {
        $projectId = $this->context->required();
        $now = Carbon::now();

        foreach (array_chunk($cityIds, self::CHUNK) as $chunk) {
            $rows = array_map(fn (int $cityId): array => [
                'project_id' => $projectId,
                'city_id' => $cityId,
                'enabled' => $enabled,
                'created_at' => $now,
                'updated_at' => $now,
            ], $chunk);

            ProjectCity::query()->upsert($rows, ['project_id', 'city_id'], ['enabled', 'updated_at']);
        }
    }
}
