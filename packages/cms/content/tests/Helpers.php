<?php

declare(strict_types=1);

use Cms\Contracts\Introspection\IntrospectionResult;
use Cms\Contracts\Introspection\Subject;
use Cms\Shared\AuthClient\Introspector;

/** Фейковый introspector: auth-service недоступен в юнит-контуре content. */
class FakeIntrospector implements Introspector
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

/** Оператор с правами content.* в проекте; возвращает заголовки admin-запроса. */
function actingAsContentOperator(string $projectId = 'proj-1', array $permissions = [
    'content.posts.view', 'content.posts.manage', 'content.posts.publish',
    'content.pages.view', 'content.pages.manage',
    'content.categories.view', 'content.categories.manage',
    'content.seo.manage', 'content.media.view', 'content.media.manage',
], array $services = ['content'], array $locales = ['en', 'ru']): array
{
    $token = new IntrospectionResult(
        subject: Subject::Admin, active: true, projectId: $projectId,
        userId: '1', permissions: $permissions, enabledServices: $services,
        locales: $locales,
    );
    $key = new IntrospectionResult(
        subject: Subject::ApiKey, active: true, projectId: $projectId,
        keyType: 'secret', scopes: ['*'], enabledServices: $services,
    );

    app()->instance(Introspector::class, new FakeIntrospector($token, $key));

    return ['Authorization' => 'Bearer test-operator-token'];
}

/** Сайт проекта с API-ключом; возвращает заголовки public-запроса. */
function actingAsProjectSite(string $projectId = 'proj-1', array $services = ['content']): array
{
    actingAsContentOperator($projectId, services: $services);

    return ['X-Api-Key' => 'pk_live_test'];
}
