<?php

use Cms\Shared\Http\Controllers\CacheBustController;
use Cms\Shared\Http\Middleware\ServiceToken;
use Illuminate\Support\Facades\Route;

// Best-effort cache-bust от auth-service: сбрасываем кэш introspection.
Route::post('/internal/cache-bust', CacheBustController::class)->middleware(ServiceToken::class);
