<?php

use Cms\Auth\Presentation\Http\Api\V1\Controllers\Site\SiteAuthController;
use Cms\Auth\Presentation\Http\Middleware\EnsureSiteUser;
use Cms\Auth\Presentation\Http\Middleware\ResolveSiteProject;
use Illuminate\Support\Facades\Route;

Route::prefix('api/v1/auth')->middleware(ResolveSiteProject::class)->group(function () {
    Route::post('register', [SiteAuthController::class, 'register']);
    Route::post('login', [SiteAuthController::class, 'login']);
    Route::post('forgot-password', [SiteAuthController::class, 'forgot']);
    Route::post('reset-password', [SiteAuthController::class, 'reset']);

    Route::middleware(['auth:web', EnsureSiteUser::class])->group(function () {
        Route::post('logout', [SiteAuthController::class, 'logout']);
        Route::get('me', [SiteAuthController::class, 'me']);
        Route::patch('me', [SiteAuthController::class, 'updateProfile']);
    });
});
