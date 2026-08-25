<?php

declare(strict_types=1);

namespace Cms\Localization\Infrastructure;

use Cms\Shared\AuthClient\AuthClient;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * Версия словаря проекта: растёт при любой записи. Панель сравнивает её с
 * `translations_version` из bootstrap и перезагружает словарь при росте;
 * auth уведомляется best-effort — потерянное уведомление догонит следующее.
 */
final class TranslationsVersion
{
    public function __construct(private readonly AuthClient $auth) {}

    public function current(string $projectId): int
    {
        return (int) Cache::get("translations:version:{$projectId}", 1);
    }

    public function bump(string $projectId): int
    {
        $version = $this->current($projectId) + 1;
        Cache::forever("translations:version:{$projectId}", $version);

        try {
            $this->auth->bumpTranslationsVersion($projectId, $version);
        } catch (\Throwable $error) {
            Log::warning('translations version notify failed', ['project' => $projectId, 'error' => $error->getMessage()]);
        }

        return $version;
    }
}
