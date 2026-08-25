<?php

use Illuminate\Support\Facades\Route;

// Контракт: каждый Cms-маршрут сервиса задокументирован в едином swagger.
test('every service route is present in the merged openapi document', function () {
    $spec = json_decode((string) file_get_contents(base_path('../../openapi/openapi.json')), true);
    expect($spec)->not->toBeNull();

    $documented = array_keys($spec['paths']);

    $missing = [];
    foreach (Route::getRoutes() as $route) {
        $action = $route->getActionName();
        if (! str_starts_with($action, 'Cms\\')) {
            continue;
        }
        $path = '/'.$route->uri();
        if (! in_array($path, $documented, true)) {
            $missing[] = $path;
        }
    }

    expect($missing)->toBe([]);
});
