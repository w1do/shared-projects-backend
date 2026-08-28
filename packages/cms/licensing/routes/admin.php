<?php

use Cms\Licensing\Presentation\Http\Api\V1\Controllers\Admin;
use Cms\Shared\AuthClient\Middleware\AuthorizeOperator;
use Cms\Shared\AuthClient\Middleware\EnsureServiceEnabled;
use Illuminate\Support\Facades\Route;

/*
 * Admin-маршруты licensing живут под pay-префиксом gateway (Д6):
 * /api/admin/v1/projects/{project}/pay/licensing/* — Caddyfile не меняется.
 */
$authorize = fn (string $permission) => [AuthorizeOperator::class.':'.$permission, EnsureServiceEnabled::class.':licensing'];

Route::prefix('api/admin/v1/projects/{project}/pay/licensing')->group(function () use ($authorize) {
    Route::get('organizations', [Admin\OrganizationController::class, 'index'])->middleware($authorize('pay.licensing.view'));
    Route::post('organizations', [Admin\OrganizationController::class, 'store'])->middleware($authorize('pay.licensing.manage'));
    Route::get('organizations/{organization}', [Admin\OrganizationController::class, 'show'])->middleware($authorize('pay.licensing.view'));
    Route::put('organizations/{organization}', [Admin\OrganizationController::class, 'update'])->middleware($authorize('pay.licensing.manage'));
    Route::delete('organizations/{organization}', [Admin\OrganizationController::class, 'destroy'])->middleware($authorize('pay.licensing.manage'));

    Route::get('plans', [Admin\PlanController::class, 'index'])->middleware($authorize('pay.licensing.view'));
    Route::post('plans', [Admin\PlanController::class, 'store'])->middleware($authorize('pay.licensing.manage'));
    Route::get('plans/{plan}', [Admin\PlanController::class, 'show'])->middleware($authorize('pay.licensing.view'));
    Route::put('plans/{plan}', [Admin\PlanController::class, 'update'])->middleware($authorize('pay.licensing.manage'));
    Route::delete('plans/{plan}', [Admin\PlanController::class, 'destroy'])->middleware($authorize('pay.licensing.manage'));

    Route::post('plans/{plan}/features', [Admin\PlanFeatureController::class, 'store'])->middleware($authorize('pay.licensing.manage'));
    Route::put('plans/{plan}/features/{feature}', [Admin\PlanFeatureController::class, 'update'])->middleware($authorize('pay.licensing.manage'));
    Route::delete('plans/{plan}/features/{feature}', [Admin\PlanFeatureController::class, 'destroy'])->middleware($authorize('pay.licensing.manage'));

    Route::get('licenses', [Admin\LicenseController::class, 'index'])->middleware($authorize('pay.licensing.view'));
    Route::post('licenses', [Admin\LicenseController::class, 'store'])->middleware($authorize('pay.licensing.manage'));
    Route::get('licenses/{license}', [Admin\LicenseController::class, 'show'])->middleware($authorize('pay.licensing.view'));
    Route::post('licenses/{license}/renew', [Admin\LicenseController::class, 'renew'])->middleware($authorize('pay.licensing.manage'));
    // однократный показ ключа авто-выпущенной лицензии (Д8) — только manage
    Route::post('licenses/{license}/reveal-key', [Admin\LicenseController::class, 'revealKey'])->middleware($authorize('pay.licensing.manage'));
    Route::post('licenses/{license}/offline-activation', [Admin\LicenseController::class, 'offlineActivation'])->middleware($authorize('pay.licensing.manage'));
    Route::post('licenses/{license}/revoke', [Admin\LicenseController::class, 'revoke'])->middleware($authorize('pay.licensing.manage'));

    Route::get('licenses/{license}/installations', [Admin\InstallationController::class, 'index'])->middleware($authorize('pay.licensing.view'));
    Route::post('installations/{installation}/revoke', [Admin\InstallationController::class, 'revoke'])->middleware($authorize('pay.licensing.manage'));

    Route::get('releases', [Admin\ReleaseController::class, 'index'])->middleware($authorize('pay.licensing.view'));
    Route::post('releases', [Admin\ReleaseController::class, 'store'])->middleware($authorize('pay.licensing.manage'));
    Route::get('releases/{release}', [Admin\ReleaseController::class, 'show'])->middleware($authorize('pay.licensing.view'));
    Route::put('releases/{release}', [Admin\ReleaseController::class, 'update'])->middleware($authorize('pay.licensing.manage'));
    Route::delete('releases/{release}', [Admin\ReleaseController::class, 'destroy'])->middleware($authorize('pay.licensing.manage'));

    Route::get('signing-key', [Admin\SigningKeyController::class, 'show'])->middleware($authorize('pay.licensing.manage'));
});
