<?php

declare(strict_types=1);

use Cms\Contracts\Introspection\IntrospectionResult;
use Cms\Contracts\Introspection\Subject;
use Cms\Shared\AuthClient\CachedIntrospector;

class FakeAnalyticsIntrospector extends CachedIntrospector
{
    public function __construct(
        private readonly IntrospectionResult $tokenResult,
        private readonly IntrospectionResult $keyResult,
    ) {}

    public function token(string $bearerToken, ?string $project = null): IntrospectionResult
    {
        return $this->tokenResult;
    }

    public function apiKey(string $apiKey): IntrospectionResult
    {
        return $this->keyResult;
    }
}

function actingAsAnalyticsOperator(string $projectId = 'proj-1', array $permissions = [
    'analytics.reports.view', 'analytics.reports.export', 'analytics.history.view',
], array $services = ['analytics'], array $scopes = ['collect']): array
{
    $token = new IntrospectionResult(subject: Subject::Admin, active: true, projectId: $projectId,
        userId: '1', permissions: $permissions, enabledServices: $services);
    $key = new IntrospectionResult(subject: Subject::ApiKey, active: true, projectId: $projectId,
        keyType: 'public', scopes: $scopes, enabledServices: $services);
    app()->instance(CachedIntrospector::class, new FakeAnalyticsIntrospector($token, $key));

    return ['Authorization' => 'Bearer test-token'];
}

function siteCollectHeaders(string $projectId = 'proj-1', array $services = ['analytics'], array $scopes = ['collect']): array
{
    actingAsAnalyticsOperator($projectId, services: $services, scopes: $scopes);

    return [
        'X-Api-Key' => 'pk_live_test',
        'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0',
    ];
}
