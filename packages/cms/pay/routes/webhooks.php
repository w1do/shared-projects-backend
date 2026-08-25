<?php

use Cms\Pay\Presentation\Http\Api\V1\Controllers\Webhooks\ProviderWebhookController;
use Illuminate\Support\Facades\Route;

// Без auth: подпись провайдера проверяется адаптером, идемпотентность — по (provider, external_id)
Route::post('webhooks/{provider}', ProviderWebhookController::class);
