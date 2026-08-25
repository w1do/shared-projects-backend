<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Queries;

use Cms\Auth\Application\DTOs\Introspection\ProjectAccessDTO;
use Cms\Auth\Domain\Models\ProjectApiKey;
use Cms\Auth\Infrastructure\Jobs\TouchApiKeyLastUsedJob;
use Cms\Contracts\Introspection\IntrospectionResult;
use Cms\Contracts\Introspection\Subject;

/** Интроспекция API-ключа проекта: сервер-сервер и публичные ключи сайта. */
final class IntrospectApiKeyQuery
{
    public function handle(string $plainKey): IntrospectionResult
    {
        $key = ProjectApiKey::findByPlainKey($plainKey);

        // Проект читается один раз через отношение ключа и переиспользуется ниже
        $project = $key?->project;

        if ($key === null || $key->isRevoked() || $project?->isArchived()) {
            return IntrospectionResult::invalid();
        }

        // Отметка использования — единственный побочный эффект, и он уезжает в Job:
        // запрос обязан остаться запросом.
        TouchApiKeyLastUsedJob::dispatch($key->id, now());

        $access = ProjectAccessDTO::fromModel($project);

        return new IntrospectionResult(
            subject: Subject::ApiKey,
            active: true,
            projectId: $key->project_id,
            keyType: $key->type,
            scopes: $key->scopes ?? [],
            enabledServices: $access->enabledServices,
            locales: $access->locales,
        );
    }
}
