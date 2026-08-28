<?php

use Cms\Analytics\Presentation\Http\Api\V1\Controllers\Admin\ReportsController;
use Cms\Analytics\Presentation\Http\Api\V1\Controllers\Admin\SettingsController;
use Cms\Shared\AuthClient\Middleware\AuthorizeOperator;
use Cms\Shared\AuthClient\Middleware\EnsureServiceEnabled;
use Illuminate\Support\Facades\Route;

$authorize = fn (string $permission) => [AuthorizeOperator::class.':'.$permission, EnsureServiceEnabled::class.':analytics'];

Route::prefix('api/admin/v1/projects/{project}/analytics')->group(function () use ($authorize) {
    Route::get('overview', [ReportsController::class, 'overview'])->middleware($authorize('analytics.reports.view'));
    Route::get('top-pages', [ReportsController::class, 'topPages'])->middleware($authorize('analytics.reports.view'));
    Route::get('revenue', [ReportsController::class, 'revenue'])->middleware($authorize('analytics.reports.view'));
    Route::get('history/{subjectKey}', [ReportsController::class, 'history'])->middleware($authorize('analytics.history.view'));
    Route::post('export', [ReportsController::class, 'export'])->middleware($authorize('analytics.reports.export'));

    Route::get('settings', [SettingsController::class, 'show'])->middleware($authorize('analytics.settings.view'));
    Route::put('settings', [SettingsController::class, 'update'])->middleware($authorize('analytics.settings.manage'));
});
