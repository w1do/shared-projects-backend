<?php

declare(strict_types=1);

use Cms\Content\Domain\Models\City;
use Cms\Content\Domain\Models\ProjectCity;
use Cms\Content\Domain\Models\Region;
use Cms\Content\Domain\Models\SeoMeta;

function seedCity(string $name = 'Казань', string $slug = 'kazan'): City
{
    $region = Region::query()->firstOrCreate(
        ['name' => 'Республика Татарстан'],
        ['federal_district' => 'Приволжский'],
    );

    return City::query()->create([
        'region_id' => $region->id,
        'name' => $name,
        'slug' => $slug,
        'population' => 1257341,
    ]);
}

function enableCityFor(string $projectId, City $city): void
{
    ProjectCity::query()->create(['project_id' => $projectId, 'city_id' => $city->id, 'enabled' => true]);
}

it('пишет и читает SEO города общим маршрутом SEO', function () {
    $city = seedCity();
    $headers = actingAsContentOperator();

    $this->putJson("/api/admin/v1/projects/proj-1/content/seo/city/{$city->id}", [
        'title' => 'Доставка бензина в Казани',
        'description' => 'Круглосуточно',
    ], $headers)->assertOk()->assertJsonPath('data.title', 'Доставка бензина в Казани');

    $this->getJson("/api/admin/v1/projects/proj-1/content/seo/city/{$city->id}", $headers)
        ->assertOk()
        ->assertJsonPath('data.description', 'Круглосуточно');
});

it('пишет SEO города маршрутом раздела за правом управления городами', function () {
    $city = seedCity();

    $this->putJson("/api/admin/v1/projects/proj-1/content/cities/{$city->id}/seo", ['title' => 'Казань'],
        actingAsContentOperator(permissions: ['content.cities.view', 'content.cities.manage']))
        ->assertOk()
        ->assertJsonPath('data.title', 'Казань');

    $this->putJson("/api/admin/v1/projects/proj-1/content/cities/{$city->id}/seo", ['title' => 'Другой'],
        actingAsContentOperator(permissions: ['content.cities.view']))
        ->assertForbidden();

    $this->getJson("/api/admin/v1/projects/proj-1/content/cities/{$city->id}/seo",
        actingAsContentOperator(permissions: ['content.cities.view']))
        ->assertOk()
        ->assertJsonPath('data.title', 'Казань');
});

it('хранит SEO одного города независимо в разных проектах', function () {
    $city = seedCity();

    $this->putJson("/api/admin/v1/projects/proj-1/content/seo/city/{$city->id}", ['title' => 'Бензин'], actingAsContentOperator('proj-1'))->assertOk();
    $this->putJson("/api/admin/v1/projects/proj-2/content/seo/city/{$city->id}", ['title' => 'Эвакуатор'], actingAsContentOperator('proj-2'))->assertOk();

    $this->getJson("/api/admin/v1/projects/proj-1/content/seo/city/{$city->id}", actingAsContentOperator('proj-1'))
        ->assertJsonPath('data.title', 'Бензин');
    $this->getJson("/api/admin/v1/projects/proj-2/content/seo/city/{$city->id}", actingAsContentOperator('proj-2'))
        ->assertJsonPath('data.title', 'Эвакуатор');

    expect(SeoMeta::acrossProjects()->count())->toBe(2);
});

it('не пополняет каталог SEO городами', function () {
    $city = seedCity();
    $headers = actingAsContentOperator();

    $this->putJson("/api/admin/v1/projects/proj-1/content/seo/city/{$city->id}", ['title' => 'Казань'], $headers)->assertOk();

    $catalog = $this->getJson('/api/admin/v1/projects/proj-1/content/seo?per_page=100', $headers);

    $catalog->assertOk();
    expect(array_unique(array_column($catalog->json('data'), 'type')))->not->toContain('city');

    $this->getJson('/api/admin/v1/projects/proj-1/content/seo?type=city', $headers)->assertStatus(422);
});

it('отдаёт публично только включённые города с их SEO', function () {
    $enabled = seedCity('Казань', 'kazan');
    $disabled = seedCity('Иннополис', 'innopolis');
    enableCityFor('proj-1', $enabled);

    $this->putJson("/api/admin/v1/projects/proj-1/content/seo/city/{$enabled->id}", ['title' => 'Доставка в Казани'], actingAsContentOperator('proj-1'))->assertOk();

    $keyHeaders = actingAsProjectSite('proj-1');

    $list = $this->getJson('/api/v1/content/cities', $keyHeaders);
    $list->assertOk();

    expect(array_column($list->json('data'), 'slug'))->toBe(['kazan'])
        ->and($list->json('data.0.seo.title'))->toBe('Доставка в Казани');

    $this->getJson('/api/v1/content/cities/kazan', $keyHeaders)
        ->assertOk()
        ->assertJsonPath('data.region_name', 'Республика Татарстан');

    $this->getJson("/api/v1/content/cities/{$disabled->slug}", $keyHeaders)->assertNotFound();
});
