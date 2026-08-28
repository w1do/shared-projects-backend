<?php

declare(strict_types=1);

use Cms\Contracts\Introspection\IntrospectionResult;
use Cms\Contracts\Introspection\Subject;
use Cms\Shared\AuthClient\Introspector;
use Cms\Shared\AuthClient\RequestIntrospection;
use Illuminate\Http\Request;

/** Фейк интроспекции: отдаёт заранее заданный результат для любого токена. */
final class FixedIntrospector implements Introspector
{
    public function __construct(private readonly IntrospectionResult $result) {}

    public function token(string $bearerToken, ?string $project = null): IntrospectionResult
    {
        return $this->result;
    }

    public function apiKey(string $apiKey): IntrospectionResult
    {
        return $this->result;
    }
}

function introspectedRequest(string $projectId = 'proj-1'): Request
{
    $request = Request::create('/api/v1/pay/subscriptions', 'GET');
    $request->headers->set('X-User-Token', 'token-1');
    $request->attributes->set('introspection', new IntrospectionResult(
        subject: Subject::ApiKey,
        active: true,
        projectId: $projectId,
    ));

    return $request;
}

test('site subscriber derives from the same introspection as site user key', function () {
    $introspection = new RequestIntrospection(new FixedIntrospector(new IntrospectionResult(
        subject: Subject::ProjectUser,
        active: true,
        projectId: 'proj-1',
        userId: '7',
    )));
    $request = introspectedRequest();

    $subscriber = $introspection->siteSubscriber($request);

    expect($subscriber?->type)->toBe('site_user')
        ->and($subscriber?->id)->toBe('7')
        ->and($subscriber?->subjectKey('proj-1'))->toBe('user:proj-1:7')
        ->and($introspection->siteUserKey($request))->toBe('user:proj-1:7');
});

test('site subscriber is null when token belongs to another project', function () {
    $introspection = new RequestIntrospection(new FixedIntrospector(new IntrospectionResult(
        subject: Subject::ProjectUser,
        active: true,
        projectId: 'proj-other',
        userId: '7',
    )));
    $request = introspectedRequest();

    expect($introspection->siteSubscriber($request))->toBeNull()
        ->and($introspection->siteUserKey($request))->toBeNull();
});

test('site subscriber is null without a user token header', function () {
    $introspection = new RequestIntrospection(new FixedIntrospector(IntrospectionResult::invalid()));
    $request = Request::create('/api/v1/pay/subscriptions', 'GET');

    expect($introspection->siteSubscriber($request))->toBeNull();
});
