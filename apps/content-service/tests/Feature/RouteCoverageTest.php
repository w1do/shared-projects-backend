<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;

/**
 * guard: 0.3 — механическая полнота покрытия маршрутов характеризационными снимками.
 *
 * Тест перебирает Route::getRoutes() content-service и падает, если пара
 * (метод, uri) не числится покрытой. Так новый маршрут физически не может
 * появиться без характеризационного снимка, а снятый с эксплуатации маршрут
 * не может тихо остаться в списке покрытых.
 *
 * Фильтр шире, чем str_starts_with($action, 'Cms\\') из OpenApiContractTest:
 * closure-маршруты (shared/routes/internal.php) обязаны попадать в перебор,
 * иначе POST /internal/cache-bust снова выпадает из-под контроля.
 *
 * Источник списка покрытых пар — снимки задачи 0.1 в каталогах
 * tests/Characterization/ пакетов content, localization и shared. Список ведётся ВРУЧНУЮ
 * и сверен с `php artisan route:list`; в комментарии к каждой паре указан
 * пакет и файл со снимком.
 */

/**
 * Пары «метод uri», у которых есть характеризационный снимок ответа.
 *
 * @return list<string>
 */
function contentRouteCoverageCoveredPairs(): array
{
    return [
        'GET api/admin/v1/projects/{project}/content/categories',                                 // content/CategoryContractTest.php
        'POST api/admin/v1/projects/{project}/content/categories',                                // content/CategoryContractTest.php, content/PostContractTest.php, content/PublicContractTest.php, content/SeoContractTest.php
        'DELETE api/admin/v1/projects/{project}/content/categories/{category}',                   // content/CategoryContractTest.php
        'PUT api/admin/v1/projects/{project}/content/categories/{category}',                      // content/CategoryContractTest.php
        'POST api/admin/v1/projects/{project}/content/categories/{category}/move',                // content/CategoryContractTest.php
        'GET api/admin/v1/projects/{project}/content/media',                                      // content/MediaContractTest.php
        'POST api/admin/v1/projects/{project}/content/media',                                     // content/MediaContractTest.php
        'GET api/admin/v1/projects/{project}/content/pages',                                      // content/PageContractTest.php
        'POST api/admin/v1/projects/{project}/content/pages',                                     // content/PageContractTest.php, content/PublicContractTest.php, content/SeoContractTest.php
        'PUT api/admin/v1/projects/{project}/content/pages/{page}',                               // content/PageContractTest.php
        'GET api/admin/v1/projects/{project}/content/pages/{page}/revisions',                     // content/PageContractTest.php
        'POST api/admin/v1/projects/{project}/content/pages/{page}/revisions/{revision}/restore', // content/PageContractTest.php
        'POST api/admin/v1/projects/{project}/content/pages/{page}/status',                       // content/PageContractTest.php, content/PublicContractTest.php
        'GET api/admin/v1/projects/{project}/content/posts',                                      // content/PostContractTest.php
        'POST api/admin/v1/projects/{project}/content/posts',                                     // content/PostContractTest.php, content/PublicContractTest.php, content/SeoContractTest.php
        'GET api/admin/v1/projects/{project}/content/posts/{post}',                               // content/PostContractTest.php
        'PUT api/admin/v1/projects/{project}/content/posts/{post}',                               // content/PostContractTest.php
        'DELETE api/admin/v1/projects/{project}/content/posts/{post}',                            // content/PostContractTest.php
        'GET api/admin/v1/projects/{project}/content/posts/{post}/revisions',                     // content/PostContractTest.php
        'POST api/admin/v1/projects/{project}/content/posts/{post}/revisions/{revision}/restore', // content/PostContractTest.php
        'POST api/admin/v1/projects/{project}/content/posts/{post}/status',                       // content/PostContractTest.php, content/PublicContractTest.php
        'GET api/admin/v1/projects/{project}/content/seo/{type}/{id}',                            // content/SeoContractTest.php
        'PUT api/admin/v1/projects/{project}/content/seo/{type}/{id}',                            // content/CategoryContractTest.php, content/PageContractTest.php, content/PostContractTest.php, content/PublicContractTest.php, content/SeoContractTest.php
        'GET api/admin/v1/projects/{project}/content/translations',                               // localization/TranslationContractTest.php
        'POST api/admin/v1/projects/{project}/content/translations',                              // localization/TranslationContractTest.php
        'POST api/admin/v1/projects/{project}/content/translations/translate-missing',            // localization/TranslationContractTest.php
        'DELETE api/admin/v1/projects/{project}/content/translations/{translation}',              // localization/TranslationContractTest.php
        'PUT api/admin/v1/projects/{project}/content/translations/{translation}',                 // localization/TranslationContractTest.php
        'GET api/admin/v1/projects/{project}/content/localizations',                              // localization/LocalizationContractTest.php
        'GET api/admin/v1/projects/{project}/content/instructs',                                  // instructs/InstructContractTest.php
        'POST api/admin/v1/projects/{project}/content/instructs',                                 // instructs/InstructContractTest.php
        'GET api/admin/v1/projects/{project}/content/instructs/categories',                       // instructs/InstructContractTest.php
        'GET api/admin/v1/projects/{project}/content/instructs/{instruct}',                       // instructs/InstructContractTest.php
        'PUT api/admin/v1/projects/{project}/content/instructs/{instruct}',                       // instructs/InstructContractTest.php
        'DELETE api/admin/v1/projects/{project}/content/instructs/{instruct}',                    // instructs/InstructContractTest.php
        'GET api/admin/v1/projects/{project}/content/research',                                   // research/ResearchContractTest.php
        'POST api/admin/v1/projects/{project}/content/research',                                  // research/ResearchContractTest.php
        'GET api/admin/v1/projects/{project}/content/research/{research}',                        // research/ResearchContractTest.php
        'POST api/admin/v1/projects/{project}/content/research/{research}/cancel',                // research/ResearchContractTest.php
        'GET api/admin/v1/projects/{project}/content/research/{research}/topics',                 // research/ResearchContractTest.php
        'POST api/admin/v1/projects/{project}/content/research/{research}/topics',                // research/ResearchContractTest.php
        'GET api/admin/v1/projects/{project}/content/topics',                                     // research/ResearchContractTest.php
        'POST api/admin/v1/projects/{project}/content/topics/{topic}/reject',                     // research/ResearchContractTest.php
        'POST api/admin/v1/projects/{project}/content/posts/generate',                            // research/ResearchContractTest.php
        'GET api/admin/v1/projects/{project}/content/buildout',                                           // research/ResearchContractTest.php
        'POST api/admin/v1/projects/{project}/content/buildout',                                          // research/ResearchContractTest.php
        'GET api/v1/content/categories',                                                          // content/PublicContractTest.php
        'GET api/v1/content/pages/{slug}',                                                        // content/PublicContractTest.php
        'GET api/v1/content/posts',                                                               // content/PublicContractTest.php
        'GET api/v1/content/posts/{slug}',                                                        // content/PublicContractTest.php
        'POST internal/cache-bust',                                                               // shared/CacheBustContractTest.php
        'GET robots.txt',                                                                         // content/PublicContractTest.php
        'GET sitemap.xml',                                                                        // content/PublicContractTest.php
    ];
}

/**
 * Маршруты без снимка — только с явной причиной, почему снимок невозможен
 * (например, эндпоинт требует недоступной в тестах инфраструктуры).
 * Пустой список — норма: снимок предпочтительнее исключения.
 *
 * @return array<string, string> пара «метод uri» => причина
 */
function contentRouteCoverageExcludedPairs(): array
{
    return [
        // Пусто: каждый маршрут content-service покрыт снимком 0.1.
    ];
}

/** Служебные маршруты фреймворка и инфраструктуры — не публичная поверхность сервиса. */
function contentRouteCoverageIsFrameworkUri(string $uri): bool
{
    $prefixes = [
        'up', 'health', 'storage/', 'sanctum/', 'horizon',
        '_ignition', '_debugbar', 'telescope', 'pulse', 'livewire/',
    ];

    foreach ($prefixes as $prefix) {
        if ($uri === rtrim($prefix, '/') || str_starts_with($uri, $prefix)) {
            return true;
        }
    }

    return false;
}

/** Публичная поверхность сервиса: api/, internal/, webhooks/ плюс два SEO-файла в корне. */
function contentRouteCoverageIsPublicSurface(string $uri): bool
{
    if (contentRouteCoverageIsFrameworkUri($uri)) {
        return false;
    }

    if (in_array($uri, ['sitemap.xml', 'robots.txt'], true)) {
        return true;
    }

    foreach (['api/', 'internal/', 'webhooks/'] as $prefix) {
        if (str_starts_with($uri, $prefix)) {
            return true;
        }
    }

    return false;
}

/**
 * Фактические пары «метод uri» сервиса. HEAD и OPTIONS отбрасываются:
 * Laravel добавляет их автоматически рядом с GET, отдельного контракта у них нет.
 *
 * @return list<string>
 */
function contentRouteCoverageActualPairs(): array
{
    $pairs = [];

    foreach (Route::getRoutes() as $route) {
        /** @var Illuminate\Routing\Route $route */
        $uri = $route->uri();

        if (! contentRouteCoverageIsPublicSurface($uri)) {
            continue;
        }

        foreach ($route->methods() as $method) {
            if (in_array($method, ['HEAD', 'OPTIONS'], true)) {
                continue;
            }

            $pairs[] = $method.' '.$uri;
        }
    }

    $pairs = array_values(array_unique($pairs));
    sort($pairs);

    return $pairs;
}

/** @return list<string> */
function contentRouteCoverageKnownPairs(): array
{
    $known = array_merge(
        contentRouteCoverageCoveredPairs(),
        array_keys(contentRouteCoverageExcludedPairs()),
    );

    $known = array_values(array_unique($known));
    sort($known);

    return $known;
}

test('guard: 0.3 every routable endpoint of content-service is covered by a characterization snapshot', function () {
    $missing = array_values(array_diff(
        contentRouteCoverageActualPairs(),
        contentRouteCoverageKnownPairs(),
    ));

    expect($missing)->toBe(
        [],
        'Маршруты без характеризационного снимка. Допиши снимок в '
        .'packages/cms/<pkg>/tests/Characterization/ и внеси пару в '
        .'contentRouteCoverageCoveredPairs(); список исключений — только с причиной.',
    );
});

test('guard: 0.3 the content-service coverage list contains no stale entries', function () {
    $stale = array_values(array_diff(
        contentRouteCoverageKnownPairs(),
        contentRouteCoverageActualPairs(),
    ));

    expect($stale)->toBe(
        [],
        'В списке покрытых пар есть маршруты, которых больше нет в сервисе: '
        .'снимок либо устарел, либо uri маршрута изменился — публичный контракт менять нельзя.',
    );
});
