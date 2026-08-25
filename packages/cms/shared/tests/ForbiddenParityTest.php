<?php

declare(strict_types=1);

use Cms\Shared\Http\ErrorEnvelope;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\Route;

/**
 * Подготовка к вводу Policies (задачи 6.6/7.3): `AuthorizationException`
 * рендерится на api-маршрутах байт-в-байт как ручной `ErrorEnvelope::forbidden()`.
 * Без этого маппинга Policy отдала бы 403 вне единого конверта ошибок.
 */
test('authorization exception renders byte-identical to manual ErrorEnvelope::forbidden', function () {
    Route::get('/api/parity-403/manual', fn () => ErrorEnvelope::forbidden());
    Route::get('/api/parity-403/policy', function (): never {
        throw new AuthorizationException;
    });

    $manual = $this->getJson('/api/parity-403/manual');
    $policy = $this->getJson('/api/parity-403/policy');

    $normalize = fn (string $body): string => (string) preg_replace(
        '/"trace_id":"[^"]+"/',
        '"trace_id":"<trace>"',
        $body,
    );

    expect($manual->getStatusCode())->toBe(403)
        ->and($policy->getStatusCode())->toBe(403)
        ->and($normalize((string) $policy->getContent()))->toBe($normalize((string) $manual->getContent()));
});
