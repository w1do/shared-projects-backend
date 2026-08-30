<?php

declare(strict_types=1);

use Cms\Content\Domain\Models\City;
use Cms\Content\Domain\Models\Region;
use Cms\Shared\Testing\ResponseSnapshot;

/** Характеризационные снимки раздела городов (routes/admin.php, routes/public.php). */

/** Справочник с зафиксированным составом; возвращает город-эталон. */
function contractCityDirectory(): City
{
    $region = Region::query()->create(['name' => 'Республика Татарстан', 'federal_district' => 'Приволжский']);

    foreach ([['Казань', 'kazan', 1257341], ['Набережные Челны', 'naberezhnye-chelny', 533839]] as [$name, $slug, $population]) {
        City::query()->create([
            'region_id' => $region->id,
            'name' => $name,
            'slug' => $slug,
            'population' => $population,
            'latitude' => 55.7963,
            'longitude' => 49.1088,
        ]);
    }

    return City::query()->where('slug', 'kazan')->firstOrFail();
}

test('contract: content cities index', function () {
    contractCityDirectory();

    ResponseSnapshot::assertMatches(
        $this->getJson('/api/admin/v1/projects/proj-1/content/cities', actingAsContentOperator()),
        'cities-index',
    );
});

test('contract: content cities regions', function () {
    contractCityDirectory();

    ResponseSnapshot::assertMatches(
        $this->getJson('/api/admin/v1/projects/proj-1/content/cities/regions', actingAsContentOperator()),
        'cities-regions',
    );
});

test('contract: content cities update', function () {
    $city = contractCityDirectory();

    ResponseSnapshot::assertMatches(
        $this->putJson("/api/admin/v1/projects/proj-1/content/cities/{$city->id}", ['enabled' => false], actingAsContentOperator()),
        'cities-update',
    );
});

test('contract: content cities update validation error', function () {
    $city = contractCityDirectory();

    ResponseSnapshot::assertMatches(
        $this->putJson("/api/admin/v1/projects/proj-1/content/cities/{$city->id}", ['enabled' => 'maybe'], actingAsContentOperator()),
        'cities-update-422',
    );
});

test('contract: content cities enable all', function () {
    contractCityDirectory();

    ResponseSnapshot::assertMatches(
        $this->postJson('/api/admin/v1/projects/proj-1/content/cities/enable-all', [], actingAsContentOperator()),
        'cities-enable-all',
    );
});

test('contract: content cities reset', function () {
    contractCityDirectory();

    ResponseSnapshot::assertMatches(
        $this->postJson('/api/admin/v1/projects/proj-1/content/cities/reset', [], actingAsContentOperator()),
        'cities-reset',
    );
});

test('contract: content city seo show null', function () {
    $city = contractCityDirectory();

    ResponseSnapshot::assertMatches(
        $this->getJson("/api/admin/v1/projects/proj-1/content/cities/{$city->id}/seo", actingAsContentOperator()),
        'cities-seo-show-null',
    );
});

test('contract: content city seo update', function () {
    $city = contractCityDirectory();

    ResponseSnapshot::assertMatches(
        $this->putJson("/api/admin/v1/projects/proj-1/content/cities/{$city->id}/seo", [
            'title' => 'Доставка бензина в Казани',
            'description' => 'Круглосуточная доставка топлива',
            'keywords' => 'бензин, Казань',
            'canonical' => 'https://site.test/kazan',
            'robots' => 'index,follow',
            'og_title' => 'Бензин в Казани',
            'og_description' => 'Доставка за час',
            'og_image' => 'https://site.test/og.png',
            'twitter_card' => 'summary_large_image',
            'json_ld' => ['@context' => 'https://schema.org', '@type' => 'City', 'name' => 'Казань'],
        ], actingAsContentOperator()),
        'cities-seo-update',
    );
});

test('contract: public cities index', function () {
    contractCityDirectory();
    $this->getJson('/api/admin/v1/projects/proj-1/content/cities', actingAsContentOperator())->assertOk();

    ResponseSnapshot::assertMatches(
        $this->getJson('/api/v1/content/cities', actingAsProjectSite()),
        'public-cities-index',
    );
});

test('contract: public city by slug', function () {
    contractCityDirectory();
    $this->getJson('/api/admin/v1/projects/proj-1/content/cities', actingAsContentOperator())->assertOk();

    ResponseSnapshot::assertMatches(
        $this->getJson('/api/v1/content/cities/kazan', actingAsProjectSite()),
        'public-cities-show',
    );
});
