<?php

declare(strict_types=1);

use Cms\Content\Domain\Models\Post;
use Cms\Content\Infrastructure\Jobs\RegenerateSitemapJob;
use Cms\Content\Infrastructure\Seo\SitemapGenerator;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;

/**
 * Задача 5.6: артефакт sitemap отдаётся без обращения к таблицам контента,
 * а синхронный fallback холодного старта СОХРАНЯЕТСЯ (п. Б9 Safety Protocol).
 */
beforeEach(function () {
    Storage::fake('local');
    config(['cms-content.site_url' => 'https://site.test']);
});

/** SQL-запросы к таблицам контента, выполненные во время замыкания. */
function contentTableQueries(Closure $body): array
{
    $queries = [];
    DB::listen(function ($query) use (&$queries): void {
        $queries[] = (string) $query->sql;
    });

    $body();

    return array_values(array_filter(
        $queries,
        static fn (string $sql): bool => preg_match('/\b(posts|pages|categories|seo_meta)\b/', $sql) === 1,
    ));
}

test('sitemap with an existing artifact does not read content tables', function () {
    app(ProjectContext::class)->set('proj-1');

    Post::factory()->create([
        'title' => 'Artifact post',
        'slug' => 'artifact-post',
        'status' => 'published',
        'published_at' => '2024-01-01 00:00:00',
        'is_index' => true,
    ]);

    // Артефакт строится один раз — дальше запрос обязан брать готовый файл
    expect(app(SitemapGenerator::class)->generate('proj-1'))->toContain('artifact-post');

    $site = actingAsProjectSite();
    $response = null;

    $touched = contentTableQueries(function () use ($site, &$response): void {
        $response = $this->get('/sitemap.xml', $site);
    });

    $response->assertOk()->assertHeader('Content-Type', 'application/xml');
    expect($response->getContent())->toContain('artifact-post')
        ->and($touched)->toBe([]);
});

test('sitemap without an artifact is generated synchronously and queued for later', function () {
    Queue::fake();

    app(ProjectContext::class)->set('proj-1');

    Post::factory()->create([
        'title' => 'Cold start post',
        'slug' => 'cold-start-post',
        'status' => 'published',
        'published_at' => '2024-01-01 00:00:00',
        'is_index' => true,
    ]);

    $site = actingAsProjectSite();

    // Артефакта нет: без синхронной генерации ответ был бы пустой картой
    $response = $this->get('/sitemap.xml', $site);

    $response->assertOk();
    expect($response->getContent())->toContain('cold-start-post');

    Queue::assertPushed(RegenerateSitemapJob::class);
});
