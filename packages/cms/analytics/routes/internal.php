<?php

use Cms\Analytics\Presentation\Http\Api\V1\Controllers\Internal\EventsController;
use Cms\Shared\Http\Middleware\ServiceToken;
use Illuminate\Support\Facades\Route;

// Сервисная аутентификация — общий middleware из shared (И15: пакет не видит Cms\Auth\*).
Route::post('internal/events', EventsController::class)->middleware(ServiceToken::class);
