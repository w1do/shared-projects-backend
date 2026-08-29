<?php

declare(strict_types=1);

use Cms\Research\Application\Exceptions\ResearchConfigurationException;
use Cms\Research\Domain\Contracts\PageContentFetcher;
use Cms\Research\Domain\Contracts\SerpSearchClient;
use Cms\Research\Domain\Enums\SearchEngine;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    config()->set('cms-research.serpapi.api_key', 'test-serp-key');
});

test('serp client maps organic results and respects the limit', function () {
    Http::fake(['*' => Http::response(['organic_results' => [
        ['position' => 1, 'title' => 'Первая', 'link' => 'https://example.com/1', 'snippet' => 'фрагмент'],
        ['position' => 2, 'title' => 'Вторая', 'link' => 'https://example.com/2'],
        ['position' => 3, 'title' => 'Третья', 'link' => 'https://example.com/3'],
    ]])]);

    $items = app(SerpSearchClient::class)->search('седаны', SearchEngine::Yandex, 2);

    expect($items)->toHaveCount(2)
        ->and($items[0]->link)->toBe('https://example.com/1')
        ->and($items[0]->snippet)->toBe('фрагмент');

    Http::assertSent(fn ($request) => str_contains($request->url(), 'text=') && str_contains($request->url(), 'engine=yandex'));
});

test('google engine uses its own query parameter', function () {
    Http::fake(['*' => Http::response(['organic_results' => []])]);

    app(SerpSearchClient::class)->search('sedans', SearchEngine::Google, 3);

    Http::assertSent(fn ($request) => str_contains($request->url(), 'q=sedans') && str_contains($request->url(), 'engine=google'));
});

test('serp client without a key fails before any network call', function () {
    config()->set('cms-research.serpapi.api_key', null);
    Http::fake();

    try {
        app(SerpSearchClient::class)->search('седаны', SearchEngine::Yandex, 3);
        $this->fail('expected ResearchConfigurationException');
    } catch (ResearchConfigurationException $exception) {
        expect($exception->getMessage())->toContain('SERPAPI_KEY')
            ->and($exception->getMessage())->not->toContain('test-serp-key');
        Http::assertNothingSent();
    }
});

test('failed search yields no results instead of an error', function () {
    Http::fake(['*' => Http::response([], 500)]);

    expect(app(SerpSearchClient::class)->search('седаны', SearchEngine::Yandex, 3))->toBe([]);
});

test('page fetcher strips markup and truncates to the configured length', function () {
    config()->set('cms-research.max_content_length', 20);
    Http::fake(['*' => Http::response('<html><head><title> Заголовок </title></head><body><script>x</script><p>Текст страницы про автомобили</p></body></html>')]);

    $page = app(PageContentFetcher::class)->fetch('https://example.com/article');

    expect($page)->not->toBeNull()
        ->and($page->title)->toBe('Заголовок')
        ->and($page->content)->not->toContain('<')
        ->and(mb_strlen($page->content))->toBe(20);
});

test('page fetcher refuses private and non-http addresses without a request', function (string $url) {
    Http::fake();

    expect(app(PageContentFetcher::class)->fetch($url))->toBeNull();

    Http::assertNothingSent();
})->with([
    'http://169.254.169.254/latest/meta-data',
    'http://127.0.0.1/admin',
    'http://10.0.0.5/internal',
    'http://localhost/admin',
    'http://service.internal/secrets',
    'file:///etc/passwd',
]);

test('page fetcher returns null on an empty or failed page', function () {
    Http::fake(['*' => Http::response('', 200)]);

    expect(app(PageContentFetcher::class)->fetch('https://example.com/empty'))->toBeNull();
});
