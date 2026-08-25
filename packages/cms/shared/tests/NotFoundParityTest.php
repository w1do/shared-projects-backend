<?php

declare(strict_types=1);

use Cms\Shared\Http\ErrorEnvelope;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Route;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * Гейт задачи 1.4: `findOrFail()` (ModelNotFoundException) и `NotFoundHttpException`
 * рендерятся на api-маршрутах байт-в-байт как ручной `ErrorEnvelope::notFound()`.
 *
 * Это разрешает заменять повторы `Model::query()->find()` + `ErrorEnvelope::notFound()`
 * на `findOrFail()` без изменения контракта 404. Составные условия lookup
 * (`where('project_id', ...)`, ownership) при замене сохраняются (Safety Protocol, И11).
 */
test('model-not-found renders byte-identical to manual ErrorEnvelope::notFound', function () {
    Route::get('/api/parity-404/manual', fn () => ErrorEnvelope::notFound());
    Route::get('/api/parity-404/model', function (): never {
        throw (new ModelNotFoundException)->setModel('App\\Models\\Stub', [42]);
    });
    Route::get('/api/parity-404/http', function (): never {
        throw new NotFoundHttpException;
    });

    $manual = $this->getJson('/api/parity-404/manual');
    $model = $this->getJson('/api/parity-404/model');
    $http = $this->getJson('/api/parity-404/http');

    $normalize = fn (string $body): string => (string) preg_replace(
        '/"trace_id":"[^"]+"/',
        '"trace_id":"<trace>"',
        $body,
    );

    expect($manual->getStatusCode())->toBe(404)
        ->and($model->getStatusCode())->toBe(404)
        ->and($http->getStatusCode())->toBe(404)
        ->and($normalize((string) $model->getContent()))->toBe($normalize((string) $manual->getContent()))
        ->and($normalize((string) $http->getContent()))->toBe($normalize((string) $manual->getContent()));
});
