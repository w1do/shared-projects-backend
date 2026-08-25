<?php

use Cms\Content\Presentation\Http\Api\V1\Controllers\Site\PublicContentController;
use Cms\Content\Presentation\Http\Api\V1\Controllers\Site\SeoFilesController;
use Cms\Shared\AuthClient\Middleware\AuthorizeProjectKey;
use Cms\Shared\AuthClient\Middleware\EnsureServiceEnabled;
use Illuminate\Support\Facades\Route;

$public = [AuthorizeProjectKey::class, EnsureServiceEnabled::class.':content'];

Route::prefix('api/v1/content')->middleware($public)->group(function () {
    Route::get('posts', [PublicContentController::class, 'posts']);
    Route::get('posts/{slug}', [PublicContentController::class, 'post']);
    Route::get('pages/{slug}', [PublicContentController::class, 'page']);
    Route::get('categories', [PublicContentController::class, 'categories']);
});

Route::middleware($public)->group(function () {
    Route::get('sitemap.xml', [SeoFilesController::class, 'sitemap']);
    Route::get('robots.txt', [SeoFilesController::class, 'robots']);
});
