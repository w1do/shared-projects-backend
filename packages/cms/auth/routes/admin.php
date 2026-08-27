<?php

use Cms\Auth\Presentation\Http\Api\V1\Controllers\Admin;
use Cms\Auth\Presentation\Http\Middleware\RequirePermission;
use Cms\Auth\Presentation\Http\Middleware\ResolveProject;
use Illuminate\Support\Facades\Route;

Route::prefix('api/admin/v1')->group(function () {
    // Аутентификация операторов
    Route::post('auth/login', [Admin\AuthController::class, 'login']);
    Route::post('auth/forgot-password', [Admin\PasswordResetController::class, 'forgot']);
    Route::post('auth/reset-password', [Admin\PasswordResetController::class, 'reset']);

    Route::middleware('auth:admin')->group(function () {
        Route::post('auth/logout', [Admin\AuthController::class, 'logout']);
        Route::get('me', [Admin\AuthController::class, 'me']);
        Route::patch('me', [Admin\AuthController::class, 'updateProfile']);
        Route::get('bootstrap', Admin\BootstrapController::class);

        Route::get('projects', [Admin\ProjectController::class, 'index']);
        Route::post('projects', [Admin\ProjectController::class, 'store']);

        Route::prefix('projects/{project}')->middleware(ResolveProject::class)->group(function () {
            Route::get('/', [Admin\ProjectController::class, 'show'])->middleware(RequirePermission::class.':auth.projects.view');
            Route::patch('/', [Admin\ProjectController::class, 'update'])->middleware(RequirePermission::class.':auth.projects.manage');
            Route::post('archive', [Admin\ProjectController::class, 'archive'])->middleware(RequirePermission::class.':auth.projects.manage');

            Route::get('members', [Admin\MemberController::class, 'index'])->middleware(RequirePermission::class.':auth.members.view');
            Route::post('members', [Admin\MemberController::class, 'store'])->middleware(RequirePermission::class.':auth.members.manage');
            Route::put('members/{member}/role', [Admin\MemberController::class, 'assignRole'])->middleware(RequirePermission::class.':auth.members.manage');
            Route::delete('members/{member}', [Admin\MemberController::class, 'destroy'])->middleware(RequirePermission::class.':auth.members.manage');

            Route::get('roles', [Admin\RoleController::class, 'index'])->middleware(RequirePermission::class.':auth.roles.view');
            Route::post('roles', [Admin\RoleController::class, 'store'])->middleware(RequirePermission::class.':auth.roles.manage');
            Route::put('roles/{role}', [Admin\RoleController::class, 'update'])->middleware(RequirePermission::class.':auth.roles.manage');
            Route::delete('roles/{role}', [Admin\RoleController::class, 'destroy'])->middleware(RequirePermission::class.':auth.roles.manage');

            Route::get('api-keys', [Admin\ApiKeyController::class, 'index'])->middleware(RequirePermission::class.':auth.keys.view');
            Route::post('api-keys', [Admin\ApiKeyController::class, 'store'])->middleware(RequirePermission::class.':auth.keys.manage');
            Route::delete('api-keys/{key}', [Admin\ApiKeyController::class, 'destroy'])->middleware(RequirePermission::class.':auth.keys.manage');

            Route::get('services', [Admin\ServiceController::class, 'index'])->middleware(RequirePermission::class.':auth.projects.view');
            Route::put('services/{service}', [Admin\ServiceController::class, 'update'])->middleware(RequirePermission::class.':auth.services.manage');

            Route::get('settings/{service}', [Admin\SettingController::class, 'show'])->middleware(RequirePermission::class.':auth.settings.view');
            Route::put('settings/{service}', [Admin\SettingController::class, 'update'])->middleware(RequirePermission::class.':auth.settings.manage');

            Route::get('site-settings', [Admin\SiteSettingController::class, 'show'])->middleware(RequirePermission::class.':auth.settings.view');
            Route::put('site-settings', [Admin\SiteSettingController::class, 'update'])->middleware(RequirePermission::class.':auth.settings.manage');

            Route::get('audit', [Admin\AuditController::class, 'index'])->middleware(RequirePermission::class.':auth.audit.view');

            Route::get('users', [Admin\ProjectUserController::class, 'index'])->middleware(RequirePermission::class.':auth.users.view');
            Route::post('users/{user}/block', [Admin\ProjectUserController::class, 'block'])->middleware(RequirePermission::class.':auth.users.manage');
            Route::post('users/{user}/unblock', [Admin\ProjectUserController::class, 'unblock'])->middleware(RequirePermission::class.':auth.users.manage');
            Route::delete('users/{user}', [Admin\ProjectUserController::class, 'destroy'])->middleware(RequirePermission::class.':auth.users.manage');
        });
    });
});
