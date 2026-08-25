<?php

declare(strict_types=1);

use Cms\Contracts\Introspection\Subject;
use Cms\Shared\AuthClient\AuthClient;
use Cms\Shared\AuthClient\CachedIntrospector;
use Illuminate\Cache\ArrayStore;
use Illuminate\Cache\Repository;
use Illuminate\Http\Client\Factory as HttpFactory;

function fakeAuthClient(array $response, int $status = 200, ?int &$calls = null): AuthClient
{
    $http = new HttpFactory;
    $http->fake(function () use ($response, $status, &$calls) {
        $calls++;

        return HttpFactory::response($response, $status);
    });

    return new AuthClient($http, 'http://auth-service:8000', 'svc-token');
}

test('introspection result is cached within ttl', function () {
    $calls = 0;
    $client = fakeAuthClient([
        'subject' => 'admin', 'active' => true, 'project_id' => 'p1',
        'user_id' => '1', 'permissions' => ['content.posts.view'],
    ], calls: $calls);
    $introspector = new CachedIntrospector($client, new Repository(new ArrayStore), 90);

    $first = $introspector->token('secret-token');
    $second = $introspector->token('secret-token');

    expect($calls)->toBe(1)
        ->and($first->subject)->toBe(Subject::Admin)
        ->and($second->can('content.posts.view'))->toBeTrue();
});

test('invalid token maps to inactive result', function () {
    $client = fakeAuthClient(['message' => 'nope'], 401);
    $introspector = new CachedIntrospector($client, new Repository(new ArrayStore), 90);

    expect($introspector->token('bad')->active)->toBeFalse();
});

test('api key introspection returns project and scopes', function () {
    $client = fakeAuthClient([
        'subject' => 'api_key', 'active' => true, 'project_id' => 'p2',
        'key_type' => 'public', 'scopes' => ['collect'], 'enabled_services' => ['analytics'],
    ]);
    $introspector = new CachedIntrospector($client, new Repository(new ArrayStore), 90);

    $result = $introspector->apiKey('pk_live_x');

    expect($result->projectId)->toBe('p2')
        ->and($result->scopes)->toBe(['collect'])
        ->and($result->serviceEnabled('analytics'))->toBeTrue();
});
