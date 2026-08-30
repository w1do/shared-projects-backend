<?php

declare(strict_types=1);

namespace Cms\Content\Application\Handlers;

use Cms\Content\Application\Commands\SyncCitiesCommand;
use Cms\Content\Application\DTOs\City\CitySyncSummaryDTO;
use Cms\Content\Domain\Contracts\CityDirectorySource;
use Cms\Content\Domain\Models\City;
use Cms\Content\Domain\Models\Region;
use Cms\Content\Domain\ValueObjects\CityRecord;
use Illuminate\Support\Collection;

/**
 * Синхронизация справочника регионов и городов: записи добавляются и
 * обновляются, удаления нет (Decision Д3). За городом стоят SEO и включённость
 * проектов, поэтому исчезнувшая из источника запись остаётся и попадает в сводку.
 */
final readonly class SyncCitiesHandler
{
    public function __construct(private CityDirectorySource $source) {}

    public function handle(SyncCitiesCommand $command): CitySyncSummaryDTO
    {
        $records = $this->source->read($command->source);

        $regions = Region::query()->get()->keyBy('name');
        [$regionsAdded, $regionsUpdated] = $this->syncRegions($records, $regions);

        $cities = City::query()->get()->keyBy(fn (City $city): string => $this->key((int) $city->region_id, $city->name));
        [$citiesAdded, $citiesUpdated, $seen] = $this->syncCities($records, $regions, $cities);

        return new CitySyncSummaryDTO(
            regions_added: $regionsAdded,
            regions_updated: $regionsUpdated,
            cities_added: $citiesAdded,
            cities_updated: $citiesUpdated,
            missing: $this->missing($cities, $seen),
        );
    }

    /**
     * @param  list<CityRecord>  $records
     * @param  Collection<string, Region>  $regions
     * @return array{int, int}
     */
    private function syncRegions(array $records, Collection $regions): array
    {
        $added = 0;
        $updated = 0;

        foreach ($this->districts($records) as $name => $district) {
            $region = $regions->get($name);

            if ($region === null) {
                $regions->put($name, Region::query()->create(['name' => $name, 'federal_district' => $district]));
                $added++;

                continue;
            }

            if ($district !== null && $region->federal_district !== $district) {
                $region->update(['federal_district' => $district]);
                $updated++;
            }
        }

        return [$added, $updated];
    }

    /**
     * @param  list<CityRecord>  $records
     * @param  Collection<string, Region>  $regions
     * @param  Collection<string, City>  $cities
     * @return array{int, int, array<string, true>}
     */
    private function syncCities(array $records, Collection $regions, Collection $cities): array
    {
        $added = 0;
        $updated = 0;
        $seen = [];

        foreach ($records as $record) {
            $region = $regions->get($record->regionName);

            if ($region === null) {
                continue;
            }

            $key = $this->key((int) $region->id, $record->name);
            $seen[$key] = true;
            $city = $cities->get($key);

            if ($city === null) {
                City::query()->create([
                    'region_id' => $region->id,
                    'name' => $record->name,
                    'slug' => $record->slug,
                    'population' => $record->population,
                    'latitude' => $record->latitude,
                    'longitude' => $record->longitude,
                ]);
                $added++;

                continue;
            }

            $city->fill([
                'population' => $record->population,
                'latitude' => $record->latitude,
                'longitude' => $record->longitude,
            ]);

            if ($city->isDirty()) {
                $city->save();
                $updated++;
            }
        }

        return [$added, $updated, $seen];
    }

    /**
     * @param  list<CityRecord>  $records
     * @return array<string, ?string>
     */
    private function districts(array $records): array
    {
        $districts = [];

        foreach ($records as $record) {
            $districts[$record->regionName] ??= $record->federalDistrict;
        }

        return $districts;
    }

    /**
     * @param  Collection<string, City>  $cities
     * @param  array<string, true>  $seen
     * @return list<string>
     */
    private function missing(Collection $cities, array $seen): array
    {
        return array_values(
            $cities
                ->reject(fn (City $city, string $key): bool => isset($seen[$key]))
                ->map(fn (City $city): string => $city->name)
                ->all(),
        );
    }

    private function key(int $regionId, string $name): string
    {
        return $regionId.'|'.$name;
    }
}
