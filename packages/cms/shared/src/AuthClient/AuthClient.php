<?php

declare(strict_types=1);

namespace Cms\Shared\AuthClient;

use Cms\Contracts\Introspection\IntrospectionResult;
use Cms\Contracts\Manifest\ServiceManifest;
use Illuminate\Http\Client\Factory as HttpFactory;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Log;

/**
 * HTTP-клиент auth-service для downstream-сервисов:
 * introspection токенов/ключей и публикация манифеста. Все вызовы — по сервисному токену.
 */
class AuthClient
{
    public function __construct(
        private readonly HttpFactory $http,
        private readonly string $baseUrl,
        private readonly string $serviceToken,
        private readonly int $timeoutSeconds = 5,
    ) {}

    public function introspectToken(string $bearerToken, ?string $project = null): IntrospectionResult
    {
        return $this->introspect(array_filter(['token' => $bearerToken, 'project' => $project]));
    }

    public function introspectApiKey(string $apiKey): IntrospectionResult
    {
        return $this->introspect(['api_key' => $apiKey]);
    }

    public function publishManifest(ServiceManifest $manifest): bool
    {
        $response = $this->request()->post('/internal/manifests', $manifest->toArray());

        return $response->successful();
    }

    /** Версия переводов проекта выросла: auth отдаст её в bootstrap. Best effort. */
    public function bumpTranslationsVersion(string $projectId, int $version): bool
    {
        $response = $this->request()->post('/internal/translations-version', [
            'project_id' => $projectId,
            'version' => $version,
        ]);

        return $response->successful();
    }

    /** Описание и тематика проекта, заполненные сборкой по AI. */
    public function setProjectProfile(string $projectId, ?string $description, ?string $topic, bool $overwrite = false): bool
    {
        $response = $this->request()->post('/internal/project-profile', array_filter([
            'project_id' => $projectId,
            'description' => $description,
            'topic' => $topic,
            'overwrite' => $overwrite,
        ], static fn (mixed $value): bool => $value !== null));

        return $response->successful();
    }

    private function introspect(array $payload): IntrospectionResult
    {
        try {
            $response = $this->request()->post('/internal/introspect', $payload);
        } catch (\Throwable $e) {
            Log::warning('auth-service introspection failed', ['exception' => $e->getMessage()]);

            throw new AuthServiceUnavailable('auth-service is unreachable.', previous: $e);
        }

        if (! $response->successful()) {
            return IntrospectionResult::invalid();
        }

        return IntrospectionResult::fromArray($response->json());
    }

    private function request(): PendingRequest
    {
        return $this->http
            ->baseUrl($this->baseUrl)
            ->timeout($this->timeoutSeconds)
            ->withToken($this->serviceToken, 'Service')
            ->acceptJson();
    }
}
