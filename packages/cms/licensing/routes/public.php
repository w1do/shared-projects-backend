<?php

use Cms\Licensing\Presentation\Http\Api\V1\Controllers\Site\ValidateLicenseController;
use Illuminate\Support\Facades\Route;

/*
 * Публичные маршруты licensing под pay-префиксом gateway (Д6):
 * /api/v1/pay/licensing/* — Caddyfile не меняется.
 *
 * Валидация БЕЗ AuthorizeProjectKey: активационный ключ и есть аутентификация,
 * проект резолвится по нему; throttle защищает от перебора (~125 бит энтропии).
 */
Route::prefix('api/v1/pay/licensing')->group(function () {
    Route::post('validate', ValidateLicenseController::class)->middleware('throttle:30,1');
});
