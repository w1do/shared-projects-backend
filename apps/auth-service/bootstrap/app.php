<?php

use Cms\Auth\Domain\Exceptions\TooManyAttempts;
use Cms\Shared\Http\ErrorEnvelope;
use Cms\Shared\Http\Middleware\AssignTraceId;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->append(AssignTraceId::class);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->is('internal/*') || $request->expectsJson(),
        );

        // Единый конверт ошибок платформы
        $exceptions->render(fn (ValidationException $e, Request $request) => ErrorEnvelope::validation($e->errors()));
        $exceptions->render(fn (AuthenticationException $e, Request $request) => ErrorEnvelope::unauthorized());
        $exceptions->render(fn (NotFoundHttpException $e, Request $request) => $request->is('api/*') ? ErrorEnvelope::notFound() : null);
        $exceptions->render(fn (TooManyAttempts $e, Request $request) => ErrorEnvelope::respond('too_many_attempts', 'Too many attempts.', 429));
    })->create();
