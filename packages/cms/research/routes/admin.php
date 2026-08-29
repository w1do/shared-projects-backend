<?php

declare(strict_types=1);

use Cms\Research\Presentation\Http\Api\V1\Controllers\ImageSearchController;
use Cms\Research\Presentation\Http\Api\V1\Controllers\PostGenerationController;
use Cms\Research\Presentation\Http\Api\V1\Controllers\ProjectBuildoutController;
use Cms\Research\Presentation\Http\Api\V1\Controllers\ResearchController;
use Cms\Research\Presentation\Http\Api\V1\Controllers\ResearchTopicController;
use Cms\Shared\AuthClient\Middleware\AuthorizeOperator;
use Cms\Shared\AuthClient\Middleware\EnsureServiceEnabled;
use Illuminate\Support\Facades\Route;

// Каждый маршрут закрыт правом; канон — как в routes контент-пакета.
$authorize = fn (string $permission): array => [AuthorizeOperator::class.':'.$permission, EnsureServiceEnabled::class.':content'];

Route::prefix('api/admin/v1/projects/{project}')->group(function () use ($authorize) {
    Route::prefix('content')->group(function () use ($authorize) {
        Route::get('research', [ResearchController::class, 'index'])->middleware($authorize('content.research.view'));
        Route::post('research', [ResearchController::class, 'store'])->middleware($authorize('content.research.run'));
        Route::get('research/{research}', [ResearchController::class, 'show'])->whereNumber('research')->middleware($authorize('content.research.view'));
        Route::post('research/{research}/cancel', [ResearchController::class, 'cancel'])->whereNumber('research')->middleware($authorize('content.research.run'));

        Route::get('research/{research}/topics', [ResearchTopicController::class, 'index'])->whereNumber('research')->middleware($authorize('content.topics.view'));
        Route::post('research/{research}/topics', [ResearchTopicController::class, 'store'])->whereNumber('research')->middleware($authorize('content.topics.manage'));
        Route::get('topics', [ResearchTopicController::class, 'all'])->middleware($authorize('content.topics.view'));
        Route::post('topics/{topic}/reject', [ResearchTopicController::class, 'reject'])->whereNumber('topic')->middleware($authorize('content.topics.manage'));

        Route::post('posts/generate', [PostGenerationController::class, 'store'])->middleware($authorize('content.posts.manage'));

        // Подбор изображения живёт рядом с интеграцией поисковой службы,
        // а закрыт правом на медиа: импорт найденного идёт в медиатеку проекта.
        Route::get('images/search', [ImageSearchController::class, 'index'])->middleware($authorize('content.media.manage'));

        // Сборку выполняет content-service, поэтому она живёт под его префиксом:
        // gateway разводит admin-маршруты по сегменту `/content`.
        Route::get('buildout', [ProjectBuildoutController::class, 'show'])->middleware($authorize('auth.projects.view'));
        Route::post('buildout', [ProjectBuildoutController::class, 'store'])->middleware($authorize('auth.projects.manage'));
    });
});
