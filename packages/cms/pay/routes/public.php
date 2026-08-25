<?php

use Cms\Pay\Presentation\Http\Api\V1\Controllers\Site\CatalogController;
use Cms\Pay\Presentation\Http\Api\V1\Controllers\Site\SiteSubscriptionController;
use Cms\Shared\AuthClient\Middleware\AuthorizeProjectKey;
use Cms\Shared\AuthClient\Middleware\EnsureServiceEnabled;
use Cms\Shared\Idempotency\IdempotencyMiddleware;
use Illuminate\Support\Facades\Route;

$public = [AuthorizeProjectKey::class, EnsureServiceEnabled::class.':pay'];

Route::prefix('api/v1/pay')->middleware($public)->group(function () {
    Route::get('plans', [CatalogController::class, 'plans']);

    Route::middleware(IdempotencyMiddleware::class)->group(function () {
        Route::post('subscriptions', [SiteSubscriptionController::class, 'subscribe']);
        Route::post('subscriptions/{subscription}/{action}', [SiteSubscriptionController::class, 'change']);
    });

    Route::get('subscriptions', [SiteSubscriptionController::class, 'mine']);
});
