<?php

use Cms\Analytics\Presentation\Http\Api\V1\Controllers\Site\CollectController;
use Cms\Shared\AuthClient\Middleware\AuthorizeProjectKey;
use Cms\Shared\AuthClient\Middleware\EnsureServiceEnabled;
use Illuminate\Support\Facades\Route;

// public key со scope collect; выключенный сервис → 404
Route::post('api/v1/collect', CollectController::class)
    ->middleware([AuthorizeProjectKey::class.':collect', EnsureServiceEnabled::class.':analytics']);
