<?php

declare(strict_types=1);

use Cms\Shared\Http\ApiResponse;
use Cms\Shared\Http\ErrorEnvelope;

test('validation error uses the shared envelope shape', function () {
    $response = ErrorEnvelope::validation(['email' => ['required']], 'trace-1');
    $body = $response->getData(true);

    expect($response->getStatusCode())->toBe(422)
        ->and($body['error']['code'])->toBe('validation_failed')
        ->and($body['error']['details'])->toBe(['email' => ['required']])
        ->and($body['error']['trace_id'])->toBe('trace-1');
});

test('not found uses the shared envelope shape', function () {
    $response = ErrorEnvelope::respond('not_found', 'Not found.', 404, [], 'trace-2');

    expect($response->getStatusCode())->toBe(404)
        ->and($response->getData(true)['error']['code'])->toBe('not_found');
});

test('api response wraps data', function () {
    expect(ApiResponse::data(['id' => 1])->getData(true))->toBe(['data' => ['id' => 1]])
        ->and(ApiResponse::created(['id' => 2])->getStatusCode())->toBe(201)
        ->and(ApiResponse::accepted()->getStatusCode())->toBe(202);
});
