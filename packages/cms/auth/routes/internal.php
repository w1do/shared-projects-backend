<?php

use Cms\Auth\Presentation\Http\Api\V1\Controllers\Internal\IntrospectController;
use Cms\Auth\Presentation\Http\Api\V1\Controllers\Internal\ManifestController;
use Cms\Auth\Presentation\Http\Api\V1\Controllers\Internal\ProjectProfileController;
use Cms\Auth\Presentation\Http\Api\V1\Controllers\Internal\TranslationsVersionController;
use Cms\Shared\Http\Middleware\ServiceToken;
use Illuminate\Support\Facades\Route;

Route::prefix('internal')->middleware(ServiceToken::class)->group(function () {
    Route::post('introspect', IntrospectController::class);
    Route::post('manifests', [ManifestController::class, 'store']);
    Route::post('translations-version', TranslationsVersionController::class);
    Route::post('project-profile', ProjectProfileController::class);
});
