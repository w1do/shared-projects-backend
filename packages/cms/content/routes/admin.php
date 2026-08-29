<?php

use Cms\Content\Presentation\Http\Api\V1\Controllers\Admin;
use Cms\Shared\AuthClient\Middleware\AuthorizeOperator;
use Cms\Shared\AuthClient\Middleware\EnsureServiceEnabled;
use Illuminate\Support\Facades\Route;

// Каждый маршрут закрыт правом; операторы проверяются через introspection auth-service.
$authorize = fn (string $permission) => [AuthorizeOperator::class.':'.$permission, EnsureServiceEnabled::class.':content'];

Route::prefix('api/admin/v1/projects/{project}/content')->group(function () use ($authorize) {
    Route::get('categories', [Admin\CategoryController::class, 'index'])->middleware($authorize('content.categories.view'));
    Route::post('categories', [Admin\CategoryController::class, 'store'])->middleware($authorize('content.categories.manage'));
    Route::post('categories/bulk-delete', [Admin\CategoryController::class, 'bulkDestroy'])->middleware($authorize('content.categories.manage'));
    Route::delete('categories', [Admin\CategoryController::class, 'purge'])->middleware($authorize('content.categories.manage'));
    Route::put('categories/{category}', [Admin\CategoryController::class, 'update'])->middleware($authorize('content.categories.manage'));
    Route::post('categories/{category}/move', [Admin\CategoryController::class, 'move'])->middleware($authorize('content.categories.manage'));
    Route::delete('categories/{category}', [Admin\CategoryController::class, 'destroy'])->middleware($authorize('content.categories.manage'));

    Route::get('posts', [Admin\PostController::class, 'index'])->middleware($authorize('content.posts.view'));
    Route::post('posts', [Admin\PostController::class, 'store'])->middleware($authorize('content.posts.manage'));
    Route::get('posts/{post}', [Admin\PostController::class, 'show'])->middleware($authorize('content.posts.view'));
    Route::put('posts/{post}', [Admin\PostController::class, 'update'])->middleware($authorize('content.posts.manage'));
    Route::delete('posts/{post}', [Admin\PostController::class, 'destroy'])->middleware($authorize('content.posts.manage'));
    Route::post('posts/{post}/status', [Admin\PostController::class, 'changeStatus'])->middleware($authorize('content.posts.publish'));
    Route::get('posts/{post}/revisions', [Admin\PostController::class, 'revisions'])->middleware($authorize('content.posts.view'));
    Route::post('posts/{post}/revisions/{revision}/restore', [Admin\PostController::class, 'restore'])->middleware($authorize('content.posts.manage'));

    Route::get('pages', [Admin\PageController::class, 'index'])->middleware($authorize('content.pages.view'));
    Route::post('pages', [Admin\PageController::class, 'store'])->middleware($authorize('content.pages.manage'));
    Route::put('pages/{page}', [Admin\PageController::class, 'update'])->middleware($authorize('content.pages.manage'));
    Route::post('pages/{page}/status', [Admin\PageController::class, 'changeStatus'])->middleware($authorize('content.pages.manage'));
    Route::get('pages/{page}/revisions', [Admin\PageController::class, 'revisions'])->middleware($authorize('content.pages.view'));
    Route::post('pages/{page}/revisions/{revision}/restore', [Admin\PageController::class, 'restore'])->middleware($authorize('content.pages.manage'));

    Route::get('seo/{type}/{id}', [Admin\SeoController::class, 'show'])->middleware($authorize('content.seo.manage'));
    Route::put('seo/{type}/{id}', [Admin\SeoController::class, 'update'])->middleware($authorize('content.seo.manage'));

    Route::get('media', [Admin\MediaController::class, 'index'])->middleware($authorize('content.media.view'));
    Route::post('media', [Admin\MediaController::class, 'store'])->middleware($authorize('content.media.manage'));
    Route::post('media/import', [Admin\MediaController::class, 'import'])->middleware($authorize('content.media.manage'));
});
