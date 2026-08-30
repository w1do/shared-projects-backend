<?php

declare(strict_types=1);

use Cms\Content\Domain\Models\City;
use Cms\Content\Domain\Models\ProjectCity;
use Cms\Content\Domain\Models\Region;
use Cms\Shared\Tenant\ProjectContext;

/** Справочник для тестов раздела: два региона, города с убывающим населением. */
function seedCityDirectory(int $count = 15): void
{
    $volga = Region::query()->create(['name' => 'Республика Татарстан', 'federal_district' => 'Приволжский']);
    $siberia = Region::query()->create(['name' => 'Новосибирская область', 'federal_district' => 'Сибирский']);

    foreach (range(1, $count) as $index) {
        City::query()->create([
            'region_id' => $index % 2 === 0 ? $volga->id : $siberia->id,
            'name' => 'Город '.$index,
            'slug' => 'city-'.$index,
            'population' => 1000000 - $index * 1000,
        ]);
    }
}

function citiesUrl(string $projectId = 'proj-1', string $suffix = ''): string
{
    return "/api/admin/v1/projects/{$projectId}/content/cities".$suffix;
}

beforeEach(function () {
    seedCityDirectory();
});

it('включает 10 крупнейших городов при первом обращении проекта', function () {
    $headers = actingAsContentOperator();

    $response = $this->getJson(citiesUrl().'?enabled=1&per_page=100', $headers);

    $response->assertOk();
    $names = array_column($response->json('data'), 'name');

    expect($names)->toHaveCount(10)
        ->and($names[0])->toBe('Город 1')
        ->and(ProjectCity::acrossProjects()->where('project_id', 'proj-1')->count())->toBe(10);
});

it('не применяет стартовый набор повторно после выключения города', function () {
    $headers = actingAsContentOperator();
    $this->getJson(citiesUrl(), $headers)->assertOk();

    $city = City::query()->orderByDesc('population')->firstOrFail();
    $this->putJson(citiesUrl().'/'.$city->id, ['enabled' => false], $headers)->assertOk();

    $response = $this->getJson(citiesUrl().'?enabled=1&per_page=100', $headers);

    expect(array_column($response->json('data'), 'name'))->not->toContain($city->name)
        ->and($response->json('data'))->toHaveCount(9);
});

it('держит состав городов проектов раздельно', function () {
    $this->getJson(citiesUrl('proj-1'), actingAsContentOperator('proj-1'))->assertOk();
    $this->postJson(citiesUrl('proj-1', '/enable-all'), [], actingAsContentOperator('proj-1'))->assertOk();

    $second = $this->getJson(citiesUrl('proj-2').'?enabled=1&per_page=100', actingAsContentOperator('proj-2'));

    expect($second->json('data'))->toHaveCount(10)
        ->and(ProjectCity::acrossProjects()->where('project_id', 'proj-1')->where('enabled', true)->count())->toBe(15);
});

it('включает все города одним запросом и возвращается к стартовому набору', function () {
    $headers = actingAsContentOperator();

    $enabled = $this->postJson(citiesUrl('proj-1', '/enable-all'), [], $headers);
    $enabled->assertOk()->assertJsonPath('data.enabled', 15);

    $reset = $this->postJson(citiesUrl('proj-1', '/reset'), [], $headers);
    $reset->assertOk()->assertJsonPath('data.enabled', 10);

    app(ProjectContext::class)->set('proj-1');
    expect(ProjectCity::query()->where('enabled', true)->count())->toBe(10);
});

it('ищет по названию и отбирает по региону', function () {
    $headers = actingAsContentOperator();
    $region = Region::query()->where('name', 'Республика Татарстан')->firstOrFail();

    $found = $this->getJson(citiesUrl().'?search=Город 12', $headers);
    expect($found->json('data'))->toHaveCount(1)
        ->and($found->json('data.0.name'))->toBe('Город 12');

    $byRegion = $this->getJson(citiesUrl()."?region_id={$region->id}&per_page=100", $headers);
    $regions = array_unique(array_column($byRegion->json('data'), 'region_name'));

    expect($regions)->toBe(['Республика Татарстан']);
});

it('сортирует по названию и по населению', function () {
    $headers = actingAsContentOperator();

    $byName = $this->getJson(citiesUrl().'?sort=name&direction=asc&per_page=3', $headers);
    $byPopulation = $this->getJson(citiesUrl().'?sort=population&direction=desc&per_page=3', $headers);

    expect(array_column($byName->json('data'), 'name'))->toBe(['Город 1', 'Город 10', 'Город 11'])
        ->and(array_column($byPopulation->json('data'), 'name'))->toBe(['Город 1', 'Город 2', 'Город 3']);
});

it('отклоняет смену состава без права управления', function () {
    $headers = actingAsContentOperator(permissions: ['content.cities.view']);
    $city = City::query()->firstOrFail();

    $this->putJson(citiesUrl().'/'.$city->id, ['enabled' => false], $headers)->assertForbidden();
    $this->postJson(citiesUrl('proj-1', '/enable-all'), [], $headers)->assertForbidden();
});

it('отвечает 404 при выключенном сервисе контента', function () {
    $headers = actingAsContentOperator(services: []);

    $this->getJson(citiesUrl(), $headers)->assertNotFound();
});

it('отдаёт регионы справочника', function () {
    $response = $this->getJson(citiesUrl('proj-1', '/regions'), actingAsContentOperator());

    $response->assertOk();
    expect(array_column($response->json('data'), 'name'))->toBe(['Новосибирская область', 'Республика Татарстан']);
});
