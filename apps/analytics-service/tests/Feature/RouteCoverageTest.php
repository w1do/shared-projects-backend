<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;

/**
 * guard: 0.3 — механическая полнота покрытия маршрутов характеризационными снимками.
 *
 * Тест перебирает Route::getRoutes() analytics-service и падает, если пара
 * (метод, uri) не числится покрытой. Так новый маршрут физически не может
 * появиться без характеризационного снимка, а снятый с эксплуатации маршрут
 * не может тихо остаться в списке покрытых.
 *
 * Фильтр шире, чем str_starts_with($action, 'Cms\\') из OpenApiContractTest:
 * closure-маршруты (shared/routes/internal.php) обязаны попадать в перебор,
 * иначе POST /internal/cache-bust снова выпадает из-под контроля.
 *
 * Источник списка покрытых пар — снимки задачи 0.1 в каталогах
 * tests/Characterization/ пакетов analytics и shared. Список ведётся ВРУЧНУЮ
 * и сверен с `php artisan route:list`; в комментарии к каждой паре указан
 * пакет и файл со снимком.
 */

/**
 * Пары «метод uri», у которых есть характеризационный снимок ответа.
 *
 * @return list<string>
 */
function analyticsRouteCoverageCoveredPairs(): array
{
    return [
        'POST api/admin/v1/projects/{project}/analytics/export',              // analytics/ReportsContractTest.php
        'GET api/admin/v1/projects/{project}/analytics/history/{subjectKey}', // analytics/ReportsContractTest.php
        'GET api/admin/v1/projects/{project}/analytics/overview',             // analytics/ReportsContractTest.php
        'GET api/admin/v1/projects/{project}/analytics/revenue',              // analytics/ReportsContractTest.php
        'GET api/admin/v1/projects/{project}/analytics/top-pages',            // analytics/ReportsContractTest.php
        'GET api/admin/v1/projects/{project}/analytics/settings',             // analytics/SettingsContractTest.php
        'PUT api/admin/v1/projects/{project}/analytics/settings',             // analytics/SettingsContractTest.php
        'GET api/v1/analytics/config',                                        // analytics/SettingsContractTest.php
        'POST api/v1/collect',                                                // analytics/CollectContractTest.php
        'POST internal/cache-bust',                                           // shared/CacheBustContractTest.php
        'POST internal/events',                                               // analytics/InternalEventsContractTest.php
    ];
}

/**
 * Маршруты без снимка — только с явной причиной, почему снимок невозможен
 * (например, эндпоинт требует недоступной в тестах инфраструктуры).
 * Пустой список — норма: снимок предпочтительнее исключения.
 *
 * @return array<string, string> пара «метод uri» => причина
 */
function analyticsRouteCoverageExcludedPairs(): array
{
    return [
        // Пусто: каждый маршрут analytics-service покрыт снимком 0.1.
    ];
}

/** Служебные маршруты фреймворка и инфраструктуры — не публичная поверхность сервиса. */
function analyticsRouteCoverageIsFrameworkUri(string $uri): bool
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
function analyticsRouteCoverageIsPublicSurface(string $uri): bool
{
    if (analyticsRouteCoverageIsFrameworkUri($uri)) {
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
function analyticsRouteCoverageActualPairs(): array
{
    $pairs = [];

    foreach (Route::getRoutes() as $route) {
        /** @var Illuminate\Routing\Route $route */
        $uri = $route->uri();

        if (! analyticsRouteCoverageIsPublicSurface($uri)) {
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
function analyticsRouteCoverageKnownPairs(): array
{
    $known = array_merge(
        analyticsRouteCoverageCoveredPairs(),
        array_keys(analyticsRouteCoverageExcludedPairs()),
    );

    $known = array_values(array_unique($known));
    sort($known);

    return $known;
}

test('guard: 0.3 every routable endpoint of analytics-service is covered by a characterization snapshot', function () {
    $missing = array_values(array_diff(
        analyticsRouteCoverageActualPairs(),
        analyticsRouteCoverageKnownPairs(),
    ));

    expect($missing)->toBe(
        [],
        'Маршруты без характеризационного снимка. Допиши снимок в '
        .'packages/cms/<pkg>/tests/Characterization/ и внеси пару в '
        .'analyticsRouteCoverageCoveredPairs(); список исключений — только с причиной.',
    );
});

test('guard: 0.3 the analytics-service coverage list contains no stale entries', function () {
    $stale = array_values(array_diff(
        analyticsRouteCoverageKnownPairs(),
        analyticsRouteCoverageActualPairs(),
    ));

    expect($stale)->toBe(
        [],
        'В списке покрытых пар есть маршруты, которых больше нет в сервисе: '
        .'снимок либо устарел, либо uri маршрута изменился — публичный контракт менять нельзя.',
    );
});
