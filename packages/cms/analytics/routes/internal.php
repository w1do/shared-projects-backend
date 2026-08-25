<?php

use Cms\Analytics\Presentation\Http\Api\V1\Controllers\Internal\EventsController;
use Illuminate\Support\Facades\Route;

Route::post('internal/events', EventsController::class);
