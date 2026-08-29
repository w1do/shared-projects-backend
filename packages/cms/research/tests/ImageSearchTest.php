<?php

declare(strict_types=1);

use Cms\Research\Application\Exceptions\ResearchConfigurationException;
use Cms\Research\Application\Exceptions\ResearchRuleViolation;
use Cms\Research\Application\Queries\SearchImagesQuery;
use Cms\Research\Domain\Contracts\SerpSearchClient;
use Cms\Research\Domain\Enums\SearchEngine;
use Cms\Research\Domain\ValueObjects\ImageResultItem;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    config()->set('cms-research.serpapi.api_key', 'test-serp-key');
});

test('serp client maps image results and respects the limit', function () {
    Http::fake(['*' => Http::response(['images_results' => [
        ['original' => 'https://cdn.test/1.jpg', 'thumbnail' => 'https://cdn.test/1-thumb.jpg', 'original_width' => 1200, 'original_height' => 800, 'source' => 'cdn.test'],
        ['original' => 'https://cdn.test/2.jpg', 'thumbnail' => 'https://cdn.test/2-thumb.jpg'],
        ['original' => 'https://cdn.test/3.jpg'],
    ]])]);

    $items = app(SerpSearchClient::class)->searchImages('седаны', SearchEngine::YandexImages, 2);

    expect($items)->toHaveCount(2)
        ->and($items[0]->link)->toBe('https://cdn.test/1.jpg')
        ->and($items[0]->thumbnail)->toBe('https://cdn.test/1-thumb.jpg')
        ->and($items[0]->width)->toBe(1200)
        ->and($items[0]->height)->toBe(800)
        ->and($items[0]->source)->toBe('cdn.test')
        ->and($items[1]->width)->toBeNull();

    Http::assertSent(fn ($request) => str_contains($request->url(), 'engine=yandex_images') && str_contains($request->url(), 'text='));
});

test('google images engine uses its own query parameter', function () {
    Http::fake(['*' => Http::response(['images_results' => []])]);

    app(SerpSearchClient::class)->searchImages('sedans', SearchEngine::GoogleImages, 5);

    Http::assertSent(fn ($request) => str_contains($request->url(), 'engine=google_images') && str_contains($request->url(), 'q=sedans'));
});

test('empty image search results are not an error', function () {
    Http::fake(['*' => Http::response(['images_results' => []])]);

    expect(app(SerpSearchClient::class)->searchImages('седаны', SearchEngine::GoogleImages, 5))->toBe([]);
});

test('image search reports a failing service instead of an empty list', function () {
    Http::fake(['*' => Http::response([], 500)]);

    expect(fn () => app(SerpSearchClient::class)->searchImages('седаны', SearchEngine::GoogleImages, 5))
        ->toThrow(ResearchRuleViolation::class);
});

test('image search without a key fails before any network call', function () {
    config()->set('cms-research.serpapi.api_key', null);
    Http::fake();

    expect(fn () => app(SearchImagesQuery::class)->handle('седаны'))
        ->toThrow(ResearchConfigurationException::class);

    Http::assertNothingSent();
});

test('image search query caps the limit by the configured maximum', function () {
    config()->set('cms-research.image_results_limit', 3);
    $client = new FakeSerpSearchClient;
    $client->images = [
        new ImageResultItem(link: 'https://cdn.test/1.jpg'),
        new ImageResultItem(link: 'https://cdn.test/2.jpg'),
        new ImageResultItem(link: 'https://cdn.test/3.jpg'),
        new ImageResultItem(link: 'https://cdn.test/4.jpg'),
    ];
    app()->instance(SerpSearchClient::class, $client);

    expect(app(SearchImagesQuery::class)->handle('седаны', 50))->toHaveCount(3)
        ->and(app(SearchImagesQuery::class)->handle('седаны'))->toHaveCount(3)
        ->and(app(SearchImagesQuery::class)->handle('седаны', 2))->toHaveCount(2);
});

test('image search query refuses an engine that does not search images', function () {
    config()->set('cms-research.image_engine', 'google');
    app()->instance(SerpSearchClient::class, new FakeSerpSearchClient);

    expect(fn () => app(SearchImagesQuery::class)->handle('седаны'))
        ->toThrow(ResearchConfigurationException::class);
});

test('image search endpoint returns results for an operator with the media permission', function () {
    $client = new FakeSerpSearchClient;
    $client->images = [new ImageResultItem(
        link: 'https://cdn.test/1.jpg',
        thumbnail: 'https://cdn.test/1-thumb.jpg',
        width: 1200,
        height: 800,
        source: 'cdn.test',
    )];
    app()->instance(SerpSearchClient::class, $client);

    $headers = actingAsContentOperator();

    $this->getJson('/api/admin/v1/projects/proj-1/content/images/search?query=sedans', $headers)
        ->assertOk()
        ->assertJsonPath('data.0.link', 'https://cdn.test/1.jpg')
        ->assertJsonPath('data.0.thumbnail', 'https://cdn.test/1-thumb.jpg')
        ->assertJsonPath('data.0.source', 'cdn.test');
});

test('image search endpoint is closed by the media manage permission', function () {
    $client = new FakeSerpSearchClient;
    app()->instance(SerpSearchClient::class, $client);

    $headers = actingAsContentOperator(permissions: ['content.media.view']);

    $this->getJson('/api/admin/v1/projects/proj-1/content/images/search?query=sedans', $headers)
        ->assertStatus(403);

    expect($client->imageCalls)->toBe(0);
});

test('image search endpoint requires a query', function () {
    app()->instance(SerpSearchClient::class, new FakeSerpSearchClient);

    $this->getJson('/api/admin/v1/projects/proj-1/content/images/search', actingAsContentOperator())
        ->assertStatus(422);
});

test('image search endpoint reports an unavailable service in a readable way', function () {
    $client = new FakeSerpSearchClient;
    $client->imageFailure = ResearchRuleViolation::imageSearchUnavailable();
    app()->instance(SerpSearchClient::class, $client);

    $this->getJson('/api/admin/v1/projects/proj-1/content/images/search?query=sedans', actingAsContentOperator())
        ->assertStatus(422)
        ->assertJsonPath('error.details.query.0', 'The image search service is unavailable or rejected the request.');
});
