<?php

use Cms\Pay\Domain\Enums\SubscriptionAction;
use Cms\Pay\Presentation\Http\Api\V1\Controllers\Admin;
use Cms\Shared\AuthClient\Middleware\AuthorizeOperator;
use Cms\Shared\AuthClient\Middleware\EnsureServiceEnabled;
use Illuminate\Support\Facades\Route;

$authorize = fn (string $permission) => [AuthorizeOperator::class.':'.$permission, EnsureServiceEnabled::class.':pay'];

Route::prefix('api/admin/v1/projects/{project}/pay')->group(function () use ($authorize) {
    Route::get('plans', [Admin\PlanController::class, 'index'])->middleware($authorize('pay.plans.view'));
    Route::post('plans', [Admin\PlanController::class, 'store'])->middleware($authorize('pay.plans.manage'));
    Route::put('plans/{plan}', [Admin\PlanController::class, 'update'])->middleware($authorize('pay.plans.manage'));
    Route::post('plans/{plan}/archive', [Admin\PlanController::class, 'archive'])->middleware($authorize('pay.plans.manage'));

    Route::get('payments', [Admin\PaymentController::class, 'index'])->middleware($authorize('pay.payments.view'));
    Route::post('payments/{payment}/confirm', [Admin\PaymentController::class, 'confirm'])->middleware($authorize('pay.payments.confirm'));
    Route::post('payments/{payment}/refund', [Admin\PaymentController::class, 'refund'])->middleware($authorize('pay.payments.refund'));

    Route::get('settings', [Admin\SettingsController::class, 'show'])->middleware($authorize('pay.settings.view'));
    Route::put('settings', [Admin\SettingsController::class, 'update'])->middleware($authorize('pay.settings.manage'));

    Route::get('providers', [Admin\ProviderAccountsController::class, 'index'])->middleware($authorize('pay.providers.view'));
    // show отдаёт расшифрованные credentials — поэтому manage, не view (Д3)
    Route::get('providers/{provider}', [Admin\ProviderAccountsController::class, 'show'])->middleware($authorize('pay.providers.manage'));
    Route::put('providers/{provider}', [Admin\ProviderAccountsController::class, 'update'])->middleware($authorize('pay.providers.manage'));

    Route::get('subscriptions', [Admin\SubscriptionAdminController::class, 'index'])->middleware($authorize('pay.subscriptions.view'));
    Route::post('subscriptions/{subscription}/{action}', [Admin\SubscriptionAdminController::class, 'change'])
        // Оператору доступен полный набор, включая delete (И2/И7)
        ->whereIn('action', SubscriptionAction::adminValues())
        ->middleware($authorize('pay.subscriptions.manage'));
});
