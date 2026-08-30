<?php

declare(strict_types=1);

use Cms\Content\Application\Commands\SyncCitiesCommand;
use Cms\Content\Application\DTOs\City\CitySyncSummaryDTO;
use Cms\Content\Application\Handlers\SyncCitiesHandler;
use Cms\Content\Domain\Models\City;
use Cms\Content\Domain\Models\Region;

/** @param  list<array{name: string, region: string, district?: string, population?: int, label?: string}>  $cities */
function writeCitySource(array $cities): string
{
    $rows = array_map(fn (array $city): array => [
        'name' => $city['name'],
        'label' => $city['label'] ?? null,
        'population' => $city['population'] ?? 0,
        'coords' => ['lat' => 55.7, 'lon' => 37.6],
        'region' => [
            'name' => $city['region'],
            'fullname' => $city['region'],
            'district' => $city['district'] ?? 'Центральный',
        ],
    ], $cities);

    $path = sys_get_temp_dir().'/cms-cities-'.getmypid().'-'.uniqid().'.json';
    file_put_contents($path, json_encode($rows, JSON_UNESCAPED_UNICODE));

    return $path;
}

function syncCities(string $path): CitySyncSummaryDTO
{
    return app(SyncCitiesHandler::class)->handle(new SyncCitiesCommand($path));
}

it('наполняет справочник первым прогоном', function () {
    $path = writeCitySource([
        ['name' => 'Казань', 'region' => 'Республика Татарстан', 'district' => 'Приволжский', 'population' => 1257341, 'label' => 'kazan'],
        ['name' => 'Новосибирск', 'region' => 'Новосибирская область', 'district' => 'Сибирский', 'population' => 1620162, 'label' => 'novosibirsk'],
    ]);

    $summary = syncCities($path);

    expect($summary->regions_added)->toBe(2)
        ->and($summary->cities_added)->toBe(2)
        ->and($summary->cities_updated)->toBe(0)
        ->and($summary->missing)->toBe([])
        ->and(City::query()->count())->toBe(2)
        ->and(Region::query()->where('name', 'Республика Татарстан')->value('federal_district'))->toBe('Приволжский')
        ->and(City::query()->where('name', 'Казань')->value('slug'))->toBe('kazan');
});

it('повторным прогоном ничего не меняет', function () {
    $path = writeCitySource([
        ['name' => 'Казань', 'region' => 'Республика Татарстан', 'population' => 1257341, 'label' => 'kazan'],
    ]);

    syncCities($path);
    $second = syncCities($path);

    expect($second->regions_added)->toBe(0)
        ->and($second->regions_updated)->toBe(0)
        ->and($second->cities_added)->toBe(0)
        ->and($second->cities_updated)->toBe(0)
        ->and(City::query()->count())->toBe(1);
});

it('обновляет изменившееся население, сохраняя слаг', function () {
    $before = writeCitySource([['name' => 'Казань', 'region' => 'Республика Татарстан', 'population' => 1000000, 'label' => 'kazan']]);
    syncCities($before);

    $after = writeCitySource([['name' => 'Казань', 'region' => 'Республика Татарстан', 'population' => 1257341, 'label' => 'other-label']]);
    $summary = syncCities($after);

    $city = City::query()->firstOrFail();

    expect($summary->cities_updated)->toBe(1)
        ->and($summary->cities_added)->toBe(0)
        ->and($city->population)->toBe(1257341)
        ->and($city->slug)->toBe('kazan');
});

it('оставляет город, исчезнувший из источника, и показывает его расхождением', function () {
    syncCities(writeCitySource([
        ['name' => 'Казань', 'region' => 'Республика Татарстан', 'label' => 'kazan'],
        ['name' => 'Иннополис', 'region' => 'Республика Татарстан', 'label' => 'innopolis'],
    ]));

    $summary = syncCities(writeCitySource([
        ['name' => 'Казань', 'region' => 'Республика Татарстан', 'label' => 'kazan'],
    ]));

    expect($summary->missing)->toBe(['Иннополис'])
        ->and(City::query()->count())->toBe(2);
});

it('разводит слаги городов-тёзок из разных регионов', function () {
    syncCities(writeCitySource([
        ['name' => 'Железногорск', 'region' => 'Красноярский край'],
        ['name' => 'Железногорск', 'region' => 'Курская область'],
    ]));

    $slugs = City::query()->orderBy('id')->pluck('slug')->all();

    expect($slugs)->toHaveCount(2)
        ->and($slugs[0])->not->toBe($slugs[1])
        ->and(array_unique($slugs))->toHaveCount(2);
});

it('читает поставляемую копию без сети', function () {
    $summary = app(SyncCitiesHandler::class)->handle(new SyncCitiesCommand);

    expect($summary->cities_added)->toBeGreaterThan(1000)
        ->and($summary->regions_added)->toBeGreaterThan(80)
        ->and($summary->missing)->toBe([]);
})->group('slow');
