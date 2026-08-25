<?php

declare(strict_types=1);

use Cms\Localization\Presentation\Http\Api\V1\Controllers\TranslationController;
use Cms\Shared\AuthClient\Middleware\AuthorizeOperator;
use Cms\Shared\AuthClient\Middleware\EnsureServiceEnabled;
use Illuminate\Support\Facades\Route;

// Каждый маршрут закрыт правом; канон — как в routes контент-пакета.
$authorize = fn (string $permission): array => [AuthorizeOperator::class.':'.$permission, EnsureServiceEnabled::class.':content'];

Route::prefix('api/admin/v1/projects/{project}/content')->group(function () use ($authorize) {
    Route::get('translations', [TranslationController::class, 'index'])->middleware($authorize('content.translations.view'));
    Route::post('translations', [TranslationController::class, 'store'])->middleware($authorize('content.translations.manage'));
    Route::put('translations/{translation}', [TranslationController::class, 'update'])->middleware($authorize('content.translations.manage'));
    Route::delete('translations/{translation}', [TranslationController::class, 'destroy'])->middleware($authorize('content.translations.manage'));
    Route::post('translations/translate-missing', [TranslationController::class, 'translateMissing'])->middleware($authorize('content.translations.manage'));
});
