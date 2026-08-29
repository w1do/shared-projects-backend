<?php

use Cms\Shared\Http\ErrorEnvelope;
use Cms\Shared\Http\Middleware\AssignTraceId;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // За gateway/внешним прокси: схема и хост берутся из X-Forwarded-*,
        // иначе абсолютные ссылки строятся от http://контейнер:8000
        $middleware->trustProxies(at: '*');
        $middleware->append(AssignTraceId::class);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->is('internal/*') || $request->expectsJson(),
        );

        $exceptions->render(fn (ValidationException $e, Request $request) => ErrorEnvelope::validation($e->errors()));
        $exceptions->render(fn (AccessDeniedHttpException $e, Request $request) => ErrorEnvelope::forbidden());
        $exceptions->render(fn (NotFoundHttpException $e, Request $request) => $request->is('api/*') ? ErrorEnvelope::notFound() : null);
    })->create();
