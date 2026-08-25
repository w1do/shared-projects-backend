<?php

declare(strict_types=1);

use Cms\Shared\Idempotency\IdempotencyMiddleware;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Cache\ArrayStore;
use Illuminate\Cache\Repository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

function runIdempotent(IdempotencyMiddleware $middleware, ?string $key, int &$sideEffects): JsonResponse
{
    $request = Request::create('/api/v1/pay/intents', 'POST');
    if ($key !== null) {
        $request->headers->set(IdempotencyMiddleware::HEADER, $key);
    }

    /** @var JsonResponse */
    return $middleware->handle($request, function () use (&$sideEffects) {
        $sideEffects++;

        return new JsonResponse(['data' => ['intent' => 'int_'.$sideEffects]], 201);
    });
}

test('repeat with the same idempotency key does not repeat the side effect', function () {
    $context = new ProjectContext;
    $context->set('p1');
    $middleware = new IdempotencyMiddleware(new Repository(new ArrayStore), $context);
    $sideEffects = 0;

    $first = runIdempotent($middleware, 'abc', $sideEffects);
    $second = runIdempotent($middleware, 'abc', $sideEffects);

    expect($sideEffects)->toBe(1)
        ->and($second->getData(true))->toBe($first->getData(true))
        ->and($second->headers->get('X-Idempotent-Replay'))->toBe('true');
});

test('different keys execute separately', function () {
    $context = new ProjectContext;
    $context->set('p1');
    $middleware = new IdempotencyMiddleware(new Repository(new ArrayStore), $context);
    $sideEffects = 0;

    runIdempotent($middleware, 'k1', $sideEffects);
    runIdempotent($middleware, 'k2', $sideEffects);

    expect($sideEffects)->toBe(2);
});

test('request without a key is not cached', function () {
    $context = new ProjectContext;
    $context->set('p1');
    $middleware = new IdempotencyMiddleware(new Repository(new ArrayStore), $context);
    $sideEffects = 0;

    runIdempotent($middleware, null, $sideEffects);
    runIdempotent($middleware, null, $sideEffects);

    expect($sideEffects)->toBe(2);
});
