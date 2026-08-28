<?php

use Cms\Licensing\Presentation\Http\Api\V1\Controllers\Site\CheckUpdatesController;
use Cms\Licensing\Presentation\Http\Api\V1\Controllers\Site\LicenseActivationController;
use Illuminate\Support\Facades\Route;

/*
 * Публичный активационный контракт (Д9): /api/v1/pay/licensing/* под
 * pay-префиксом gateway — Caddyfile не меняется.
 *
 * БЕЗ AuthorizeProjectKey: активационный ключ и есть аутентификация,
 * проект резолвится по нему; throttle 60,1 защищает от перебора (ТЗ 2.10).
 */
Route::prefix('api/v1/pay/licensing')->middleware('throttle:60,1')->group(function () {
    Route::post('license/activate', [LicenseActivationController::class, 'activate']);
    Route::post('license/refresh', [LicenseActivationController::class, 'refresh']);
    Route::post('license/deactivate', [LicenseActivationController::class, 'deactivate']);
    Route::post('updates/check', CheckUpdatesController::class);
});
