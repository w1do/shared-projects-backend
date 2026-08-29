<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;

/**
 * guard: 0.3 — механическая полнота покрытия маршрутов характеризационными снимками.
 *
 * Тест перебирает Route::getRoutes() auth-service и падает, если пара
 * (метод, uri) не числится покрытой. Так новый маршрут физически не может
 * появиться без характеризационного снимка, а снятый с эксплуатации маршрут
 * не может тихо остаться в списке покрытых.
 *
 * Фильтр шире, чем str_starts_with($action, 'Cms\\') из OpenApiContractTest:
 * closure-маршруты (shared/routes/internal.php) обязаны попадать в перебор,
 * иначе POST /internal/cache-bust снова выпадает из-под контроля.
 *
 * Источник списка покрытых пар — снимки задачи 0.1 в каталогах
 * tests/Characterization/ пакетов auth и shared. Список ведётся ВРУЧНУЮ
 * и сверен с `php artisan route:list`; в комментарии к каждой паре указан
 * пакет и файл со снимком.
 */

/**
 * Пары «метод uri», у которых есть характеризационный снимок ответа.
 *
 * @return list<string>
 */
function authRouteCoverageCoveredPairs(): array
{
    return [
        'POST api/admin/v1/auth/forgot-password',                    // auth/AdminAccountContractTest.php
        'POST api/admin/v1/auth/login',                              // auth/AdminAccountContractTest.php, auth/AdminContractTest.php
        'POST api/admin/v1/auth/logout',                             // auth/AdminAccountContractTest.php
        'POST api/admin/v1/auth/reset-password',                     // auth/AdminAccountContractTest.php
        'GET api/admin/v1/bootstrap',                                // auth/AdminContractTest.php
        'GET api/admin/v1/me',                                       // auth/AdminContractTest.php
        'PATCH api/admin/v1/me',                                     // auth/AdminAccountContractTest.php
        'GET api/admin/v1/projects',                                 // auth/AdminContractTest.php
        'POST api/admin/v1/projects',                                // auth/AdminContractTest.php
        'GET api/admin/v1/projects/{project}',                       // auth/AdminContractTest.php, auth/AdminProjectContractTest.php
        'PATCH api/admin/v1/projects/{project}',                     // auth/AdminAuditContractTest.php, auth/AdminProjectContractTest.php
        'GET api/admin/v1/projects/{project}/api-keys',              // auth/AdminApiKeyContractTest.php
        'POST api/admin/v1/projects/{project}/api-keys',             // auth/AdminApiKeyContractTest.php
        'DELETE api/admin/v1/projects/{project}/api-keys/{key}',     // auth/AdminApiKeyContractTest.php
        'POST api/admin/v1/projects/{project}/archive',              // auth/AdminAuditContractTest.php, auth/AdminProjectContractTest.php
        'GET api/admin/v1/projects/{project}/audit',                 // auth/AdminAuditContractTest.php
        'GET api/admin/v1/projects/{project}/members',               // auth/AdminContractTest.php, auth/AdminMemberContractTest.php
        'POST api/admin/v1/projects/{project}/members',              // auth/AdminContractTest.php
        'DELETE api/admin/v1/projects/{project}/members/{member}',   // auth/AdminMemberContractTest.php
        'PUT api/admin/v1/projects/{project}/members/{member}/role', // auth/AdminMemberContractTest.php
        'GET api/admin/v1/projects/{project}/roles',                 // auth/AdminContractTest.php, auth/AdminRoleContractTest.php
        'POST api/admin/v1/projects/{project}/roles',                // auth/AdminContractTest.php, auth/AdminRoleContractTest.php
        'DELETE api/admin/v1/projects/{project}/roles/{role}',       // auth/AdminContractTest.php, auth/AdminRoleContractTest.php
        'PUT api/admin/v1/projects/{project}/roles/{role}',          // auth/AdminRoleContractTest.php
        'GET api/admin/v1/projects/{project}/services',              // auth/AdminServiceContractTest.php
        'PUT api/admin/v1/projects/{project}/services/{service}',    // auth/AdminServiceContractTest.php
        'GET api/admin/v1/projects/{project}/settings/{service}',    // auth/AdminSettingContractTest.php
        'PUT api/admin/v1/projects/{project}/settings/{service}',    // auth/AdminSettingContractTest.php
        'GET api/admin/v1/projects/{project}/site-settings',         // auth/AdminSiteSettingContractTest.php
        'PUT api/admin/v1/projects/{project}/site-settings',         // auth/AdminSiteSettingContractTest.php
        'GET api/admin/v1/projects/{project}/users',                 // auth/AdminProjectUserContractTest.php
        'DELETE api/admin/v1/projects/{project}/users/{user}',       // auth/AdminProjectUserContractTest.php
        'POST api/admin/v1/projects/{project}/users/{user}/block',   // auth/AdminProjectUserContractTest.php
        'POST api/admin/v1/projects/{project}/users/{user}/unblock', // auth/AdminProjectUserContractTest.php
        'POST api/v1/auth/forgot-password',                          // auth/SiteAuthContractTest.php
        'POST api/v1/auth/login',                                    // auth/SiteAuthContractTest.php
        'POST api/v1/auth/logout',                                   // auth/SiteAuthContractTest.php
        'GET api/v1/auth/me',                                        // auth/SiteAuthContractTest.php
        'PATCH api/v1/auth/me',                                      // auth/SiteAuthContractTest.php
        'POST api/v1/auth/register',                                 // auth/SiteAuthContractTest.php
        'POST api/v1/auth/reset-password',                           // auth/SiteAuthContractTest.php
        'POST internal/cache-bust',                                  // shared/CacheBustContractTest.php
        'POST internal/introspect',                                  // auth/InternalContractTest.php
        'POST internal/manifests',                                   // auth/InternalContractTest.php
        'POST internal/translations-version',                        // auth/InternalContractTest.php
        'POST internal/project-profile',                             // auth/InternalContractTest.php
    ];
}

/**
 * Маршруты без снимка — только с явной причиной, почему снимок невозможен
 * (например, эндпоинт требует недоступной в тестах инфраструктуры).
 * Пустой список — норма: снимок предпочтительнее исключения.
 *
 * @return array<string, string> пара «метод uri» => причина
 */
function authRouteCoverageExcludedPairs(): array
{
    return [
        // Пусто: каждый маршрут auth-service покрыт снимком 0.1.
    ];
}

/** Служебные маршруты фреймворка и инфраструктуры — не публичная поверхность сервиса. */
function authRouteCoverageIsFrameworkUri(string $uri): bool
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
function authRouteCoverageIsPublicSurface(string $uri): bool
{
    if (authRouteCoverageIsFrameworkUri($uri)) {
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
function authRouteCoverageActualPairs(): array
{
    $pairs = [];

    foreach (Route::getRoutes() as $route) {
        /** @var Illuminate\Routing\Route $route */
        $uri = $route->uri();

        if (! authRouteCoverageIsPublicSurface($uri)) {
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
function authRouteCoverageKnownPairs(): array
{
    $known = array_merge(
        authRouteCoverageCoveredPairs(),
        array_keys(authRouteCoverageExcludedPairs()),
    );

    $known = array_values(array_unique($known));
    sort($known);

    return $known;
}

test('guard: 0.3 every routable endpoint of auth-service is covered by a characterization snapshot', function () {
    $missing = array_values(array_diff(
        authRouteCoverageActualPairs(),
        authRouteCoverageKnownPairs(),
    ));

    expect($missing)->toBe(
        [],
        'Маршруты без характеризационного снимка. Допиши снимок в '
        .'packages/cms/<pkg>/tests/Characterization/ и внеси пару в '
        .'authRouteCoverageCoveredPairs(); список исключений — только с причиной.',
    );
});

test('guard: 0.3 the auth-service coverage list contains no stale entries', function () {
    $stale = array_values(array_diff(
        authRouteCoverageKnownPairs(),
        authRouteCoverageActualPairs(),
    ));

    expect($stale)->toBe(
        [],
        'В списке покрытых пар есть маршруты, которых больше нет в сервисе: '
        .'снимок либо устарел, либо uri маршрута изменился — публичный контракт менять нельзя.',
    );
});
