<?php

declare(strict_types=1);

use Cms\Instructs\Presentation\Http\Api\V1\Controllers\InstructController;
use Cms\Shared\AuthClient\Middleware\AuthorizeOperator;
use Cms\Shared\AuthClient\Middleware\EnsureServiceEnabled;
use Illuminate\Support\Facades\Route;

// Каждый маршрут закрыт правом; канон — как в routes контент-пакета.
$authorize = fn (string $permission): array => [AuthorizeOperator::class.':'.$permission, EnsureServiceEnabled::class.':content'];

Route::prefix('api/admin/v1/projects/{project}/content')->group(function () use ($authorize) {
    Route::get('instructs', [InstructController::class, 'index'])->middleware($authorize('content.instructs.view'));
    Route::get('instructs/categories', [InstructController::class, 'categories'])->middleware($authorize('content.instructs.view'));
    Route::get('instructs/{instruct}', [InstructController::class, 'show'])->whereNumber('instruct')->middleware($authorize('content.instructs.view'));
    Route::post('instructs', [InstructController::class, 'store'])->middleware($authorize('content.instructs.manage'));
    Route::put('instructs/{instruct}', [InstructController::class, 'update'])->whereNumber('instruct')->middleware($authorize('content.instructs.manage'));
    Route::delete('instructs/{instruct}', [InstructController::class, 'destroy'])->whereNumber('instruct')->middleware($authorize('content.instructs.manage'));
});
