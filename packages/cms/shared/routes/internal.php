<?php

use Cms\Shared\Http\ErrorEnvelope;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Route;

// Best-effort cache-bust от auth-service: сбрасываем кэш introspection.
Route::post('/internal/cache-bust', function (Request $request) {
    $expected = (string) config('cms.service_token');
    if ($expected === '' || ! hash_equals('Service '.$expected, (string) $request->header('Authorization', ''))) {
        return ErrorEnvelope::unauthorized('Service token required.');
    }

    Cache::flush();

    return response()->json(['flushed' => true]);
});
