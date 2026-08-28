<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;

/**
 * guard: 0.3 — механическая полнота покрытия маршрутов характеризационными снимками.
 *
 * Тест перебирает Route::getRoutes() pay-service и падает, если пара
 * (метод, uri) не числится покрытой. Так новый маршрут физически не может
 * появиться без характеризационного снимка, а снятый с эксплуатации маршрут
 * не может тихо остаться в списке покрытых.
 *
 * Фильтр шире, чем str_starts_with($action, 'Cms\\') из OpenApiContractTest:
 * closure-маршруты (shared/routes/internal.php) обязаны попадать в перебор,
 * иначе POST /internal/cache-bust снова выпадает из-под контроля.
 *
 * Источник списка покрытых пар — снимки задачи 0.1 в каталогах
 * tests/Characterization/ пакетов pay и shared. Список ведётся ВРУЧНУЮ
 * и сверен с `php artisan route:list`; в комментарии к каждой паре указан
 * пакет и файл со снимком.
 */

/**
 * Пары «метод uri», у которых есть характеризационный снимок ответа.
 *
 * @return list<string>
 */
function payRouteCoverageCoveredPairs(): array
{
    return [
        'GET api/admin/v1/projects/{project}/pay/payments',                               // pay/AdminContractTest.php
        'POST api/admin/v1/projects/{project}/pay/payments/{payment}/confirm',            // pay/AdminContractTest.php
        'POST api/admin/v1/projects/{project}/pay/payments/{payment}/refund',             // pay/AdminContractTest.php
        'GET api/admin/v1/projects/{project}/pay/plans',                                  // pay/AdminContractTest.php
        'POST api/admin/v1/projects/{project}/pay/plans',                                 // pay/AdminContractTest.php
        'PUT api/admin/v1/projects/{project}/pay/plans/{plan}',                           // pay/AdminContractTest.php
        'POST api/admin/v1/projects/{project}/pay/plans/{plan}/archive',                  // pay/AdminContractTest.php
        'GET api/admin/v1/projects/{project}/pay/providers',                              // pay/ProviderSettingsContractTest.php
        'GET api/admin/v1/projects/{project}/pay/providers/{provider}',                   // pay/ProviderSettingsContractTest.php
        'PUT api/admin/v1/projects/{project}/pay/providers/{provider}',                   // pay/ProviderSettingsContractTest.php
        'GET api/admin/v1/projects/{project}/pay/licensing/organizations',                // licensing/LicensingContractTest.php
        'POST api/admin/v1/projects/{project}/pay/licensing/organizations',               // licensing/LicensingContractTest.php
        'GET api/admin/v1/projects/{project}/pay/licensing/organizations/{organization}', // licensing/LicensingContractTest.php
        'PUT api/admin/v1/projects/{project}/pay/licensing/organizations/{organization}', // licensing/LicensingContractTest.php
        'DELETE api/admin/v1/projects/{project}/pay/licensing/organizations/{organization}', // licensing/LicensingContractTest.php
        'GET api/admin/v1/projects/{project}/pay/licensing/plans',                        // licensing/LicensingContractTest.php
        'POST api/admin/v1/projects/{project}/pay/licensing/plans',                       // licensing/LicensingContractTest.php
        'GET api/admin/v1/projects/{project}/pay/licensing/plans/{plan}',                 // licensing/LicensingContractTest.php
        'PUT api/admin/v1/projects/{project}/pay/licensing/plans/{plan}',                 // licensing/LicensingContractTest.php
        'DELETE api/admin/v1/projects/{project}/pay/licensing/plans/{plan}',              // licensing/LicensingContractTest.php
        'GET api/admin/v1/projects/{project}/pay/licensing/licenses',                     // licensing/LicensingContractTest.php
        'POST api/admin/v1/projects/{project}/pay/licensing/licenses',                    // licensing/LicensingContractTest.php
        'GET api/admin/v1/projects/{project}/pay/licensing/licenses/{license}',           // licensing/LicensingContractTest.php
        'GET api/admin/v1/projects/{project}/pay/licensing/licenses/{license}/file',      // licensing/LicensingContractTest.php
        'POST api/admin/v1/projects/{project}/pay/licensing/licenses/{license}/revoke',   // licensing/LicensingContractTest.php
        'GET api/admin/v1/projects/{project}/pay/licensing/signing-key',                  // licensing/LicensingContractTest.php
        'POST api/v1/pay/licensing/validate',                                             // licensing/LicensingContractTest.php
        'POST api/admin/v1/projects/{project}/pay/licensing/plans/{plan}/features',       // licensing/LicensingContractTest.php
        'PUT api/admin/v1/projects/{project}/pay/licensing/plans/{plan}/features/{feature}', // licensing/LicensingContractTest.php
        'DELETE api/admin/v1/projects/{project}/pay/licensing/plans/{plan}/features/{feature}', // licensing/LicensingContractTest.php
        'GET api/admin/v1/projects/{project}/pay/settings',                               // pay/SettingsContractTest.php
        'PUT api/admin/v1/projects/{project}/pay/settings',                               // pay/SettingsContractTest.php
        'GET api/admin/v1/projects/{project}/pay/subscriptions',                          // pay/AdminContractTest.php
        'POST api/admin/v1/projects/{project}/pay/subscriptions',                         // pay/AdminContractTest.php
        'POST api/admin/v1/projects/{project}/pay/subscriptions/{subscription}/{action}', // pay/AdminContractTest.php
        'GET api/v1/pay/plans',                                                           // pay/PublicContractTest.php
        'GET api/v1/pay/subscriptions',                                                   // pay/PublicContractTest.php
        'POST api/v1/pay/subscriptions',                                                  // pay/PublicContractTest.php
        'POST api/v1/pay/subscriptions/{subscription}/{action}',                          // pay/PublicContractTest.php
        'POST internal/cache-bust',                                                       // shared/CacheBustContractTest.php
        'POST webhooks/{provider}',                                                       // pay/WebhookContractTest.php
    ];
}

/**
 * Маршруты без снимка — только с явной причиной, почему снимок невозможен
 * (например, эндпоинт требует недоступной в тестах инфраструктуры).
 * Пустой список — норма: снимок предпочтительнее исключения.
 *
 * @return array<string, string> пара «метод uri» => причина
 */
function payRouteCoverageExcludedPairs(): array
{
    return [
        // Пусто: каждый маршрут pay-service покрыт снимком 0.1.
    ];
}

/** Служебные маршруты фреймворка и инфраструктуры — не публичная поверхность сервиса. */
function payRouteCoverageIsFrameworkUri(string $uri): bool
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
function payRouteCoverageIsPublicSurface(string $uri): bool
{
    if (payRouteCoverageIsFrameworkUri($uri)) {
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
function payRouteCoverageActualPairs(): array
{
    $pairs = [];

    foreach (Route::getRoutes() as $route) {
        /** @var Illuminate\Routing\Route $route */
        $uri = $route->uri();

        if (! payRouteCoverageIsPublicSurface($uri)) {
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
function payRouteCoverageKnownPairs(): array
{
    $known = array_merge(
        payRouteCoverageCoveredPairs(),
        array_keys(payRouteCoverageExcludedPairs()),
    );

    $known = array_values(array_unique($known));
    sort($known);

    return $known;
}

test('guard: 0.3 every routable endpoint of pay-service is covered by a characterization snapshot', function () {
    $missing = array_values(array_diff(
        payRouteCoverageActualPairs(),
        payRouteCoverageKnownPairs(),
    ));

    expect($missing)->toBe(
        [],
        'Маршруты без характеризационного снимка. Допиши снимок в '
        .'packages/cms/<pkg>/tests/Characterization/ и внеси пару в '
        .'payRouteCoverageCoveredPairs(); список исключений — только с причиной.',
    );
});

test('guard: 0.3 the pay-service coverage list contains no stale entries', function () {
    $stale = array_values(array_diff(
        payRouteCoverageKnownPairs(),
        payRouteCoverageActualPairs(),
    ));

    expect($stale)->toBe(
        [],
        'В списке покрытых пар есть маршруты, которых больше нет в сервисе: '
        .'снимок либо устарел, либо uri маршрута изменился — публичный контракт менять нельзя.',
    );
});
