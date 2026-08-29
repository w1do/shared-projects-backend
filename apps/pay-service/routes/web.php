<?php

use Illuminate\Support\Facades\Route;

Route::get('/health', fn () => response()->json([
    'service' => 'pay-service',
    'status' => 'ok',
    'version' => config('cms.version'),
    'time' => now()->toIso8601String(),
]));
