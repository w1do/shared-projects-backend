<?php

use Illuminate\Support\Facades\Route;

Route::get('/health', fn () => response()->json([
    'service' => 'content-service',
    'status' => 'ok',
    'time' => now()->toIso8601String(),
]));
